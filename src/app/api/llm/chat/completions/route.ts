// ─────────────────────────────────────────────
// ElevenLabs ConvAI — custom LLM webhook
// ElevenLabs sends the conversation history here; we inject our story
// system prompt, call Mistral Large, and return an OpenAI-compatible response.
// ElevenLabs then converts our text to Elara's voice.
//
// ElevenLabs auto-appends /chat/completions to the Server URL,
// so this route lives at /api/llm/chat/completions.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getGameConfig, DEFAULT_STORY_ID, type StoryId } from "@/lib/config-loader";
import {
  getSession,
  createSession,
  updateSession,
} from "@/lib/session-store";
import { initState, getCurrentBeat, advanceBeat, advancePhase, evaluateEndingCondition, resolveChoice } from "@/lib/state-machine";
import { buildContext } from "@/lib/llm/context-builder";
import { parseSoundCues } from "@/lib/sound-cue-parser";
import { callMistralStory, streamMistralStory, MistralIntentParser } from "@/lib/llm/mistral-adapter";
import type { ConversationTurn, StoryState } from "@/lib/types/story-state";
import type { SessionData } from "@/lib/session-store";
import type { GameConfig, Beat, ChoiceOption } from "@/lib/types/game-config";

// Must be Node.js runtime — Edge does not support module-level Map persistence
export const runtime = "nodejs";

// Story configs are cached inside getGameConfig() per storyId
function getConfig(storyId?: StoryId): GameConfig {
  return getGameConfig(storyId);
}

const intentParser = new MistralIntentParser(process.env.MISTRAL_API_KEY!);

interface LLMWebhookMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMWebhookRequest {
  messages: LLMWebhookMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  conversation_id?: string;
  custom_llm_extra_body?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const requestStart = Date.now();
  console.log(`[WEBHOOK] === NEW REQUEST === timestamp=${new Date(requestStart).toISOString()}`);

  try {
    const body = (await req.json()) as LLMWebhookRequest;

    // ── Log full request shape ───────────────────────────────────
    const messageSummary = (body.messages ?? []).map((m) => ({
      role: m.role,
      contentLength: m.content?.length ?? 0,
    }));
    const elevenLabsSystemPrompt = body.messages?.find((m) => m.role === "system")?.content ?? "";
    console.log(`[WEBHOOK] Body parsed: messageCount=${body.messages?.length ?? 0}, stream=${body.stream ?? false}`);
    console.log(`[WEBHOOK] Messages breakdown:`, JSON.stringify(messageSummary));
    console.log(`[WEBHOOK] ElevenLabs system prompt preview (first 200): "${elevenLabsSystemPrompt.slice(0, 200)}"`);
    console.log(`[WEBHOOK] conversation_id from body: ${body.conversation_id ?? "(none)"}`);
    console.log(`[WEBHOOK] custom_llm_extra_body present: ${!!body.custom_llm_extra_body}`);

    const { messages } = body;

    if (!Array.isArray(messages)) {
      console.error("[WEBHOOK] ERROR: messages field is not an array");
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Extract conversation_id from available sources (priority order)
    let conversation_id = body.conversation_id
      ?? (body.custom_llm_extra_body?.conversation_id as string | undefined)
      ?? undefined;

    // If no conversation_id available, generate one from the FIRST user message.
    // ElevenLabs accumulates the full conversation history on each request,
    // so the first user message stays constant across all turns of the same session.
    // Using the last message would create a new session every turn, losing game state.
    if (!conversation_id) {
      const userMsgs = messages.filter(m => m.role === "user");
      const firstUserMsg = userMsgs[0]?.content ?? "";
      // Simple hash: use first 16 chars of base64-encoded content for uniqueness
      const hash = Buffer.from(firstUserMsg).toString("base64").slice(0, 16);
      conversation_id = `auto-${hash}`;
      console.log(`[WEBHOOK] No conversation_id found — generated from first user message: ${conversation_id}`);
    }

    // Determine story ID — from existing session or from request metadata
    const requestStoryId = (body.custom_llm_extra_body?.story_id as StoryId | undefined) ?? DEFAULT_STORY_ID;

    // Get or init session state
    let session = getSession(conversation_id);
    const sessionWasNew = !session;
    const storyId = session?.storyId ?? requestStoryId;
    let config: GameConfig;
    try {
      config = getConfig(storyId);
    } catch (cfgErr) {
      console.error(`[WEBHOOK] Failed to load story "${storyId}":`, cfgErr);
      return openAiSSEResponse("I'm sorry, I cannot find that story right now. Please try again.");
    }
    if (!session) {
      const initialState = initState(config);
      session = createSession(conversation_id, initialState, storyId);
    }
    console.log(
      `[WEBHOOK] Session: ${sessionWasNew ? "created" : "found"}, conversationId=${conversation_id}, gameOver=${session.gameOver}, phase=${session.state.currentPhaseIndex}, beat=${session.state.currentBeatIndex}`,
    );

    if (session.gameOver) {
      console.log(`[WEBHOOK] Session is gameOver — returning early end message`);
      return openAiSSEResponse("The session has ended. Goodbye.");
    }

    // ── Extract player's latest message ──────────────────────────
    const userMessages = messages.filter((m) => m.role === "user");
    const playerText = String(userMessages[userMessages.length - 1]?.content ?? "").trim();
    console.log(`[WEBHOOK] Player said: "${playerText.slice(0, 100)}${playerText.length > 100 ? "..." : ""}"`);

    // ── Detect silence auto-advance (sent by client after 8s of silence) ──
    const isSilenceNudge = playerText === "[silence]";
    if (isSilenceNudge) {
      console.log(`[WEBHOOK] Silence nudge detected — AI will continue narrating`);
    }

    // ── If there's a pending voice choice, match the player's response ──
    let { state } = session;
    const currentPendingChoice = session.pendingChoice;
    if (currentPendingChoice && playerText && !isSilenceNudge) {
      const choiceOptions = currentPendingChoice.options;
      const matchedOption = choiceOptions.find((opt) => {
        const words = opt.label.toLowerCase().split(/\s+/);
        const playerLower = playerText.toLowerCase();
        return words.some((word) => word.length > 3 && playerLower.includes(word));
      });

      if (matchedOption) {
        console.log(`[WEBHOOK] Choice match: matched — option id="${matchedOption.id}", label="${matchedOption.label}"`);
        const beat = config.arc.phases[state.currentPhaseIndex]?.beats?.find(
          (b: Beat) => b.id === currentPendingChoice.beatId,
        );
        const fullOption = beat?.options?.find((o: ChoiceOption) => o.id === matchedOption.id);
        if (fullOption) {
          state = resolveChoice(state, currentPendingChoice.beatId, matchedOption.id, fullOption);
          updateSession(conversation_id, { state, pendingChoice: null });
          // Refresh session reference after update
          session = getSession(conversation_id)!;
        }
      } else {
        console.log(`[WEBHOOK] Choice match: no-match (pendingChoice beatId="${currentPendingChoice.beatId}", options=[${choiceOptions.map((o) => o.label).join(", ")}])`);
      }
    } else if (!currentPendingChoice) {
      console.log(`[WEBHOOK] Choice match: no-pending`);
    }

    // ── Build story system prompt ─────────────────────────────────
    const currentPhaseIndex = state.currentPhaseIndex;
    const currentPhase = config.arc.phases[currentPhaseIndex];
    const currentBeat = getCurrentBeat(config, state);

    let { systemPrompt } = buildContext(config, state, currentPhase, currentBeat);

    // ── Silence nudge: tell the AI to continue narrating ──────────
    if (isSilenceNudge) {
      systemPrompt += "\n\n[SILENCE] The player has been silent for a while. If your last response asked a question, gently rephrase or offer a prompt to guide them. If your last response was narration, continue the story naturally — advance the scene or deepen the atmosphere. Keep it to 1-2 sentences. Do not ask if the player is still there.";
    }

    // ── If a voice choice is pending, inject directive into system prompt ──
    // This happens when the previous turn detected a choice beat. Elara
    // should present the options verbally so the player can respond by voice.
    if (session.pendingChoice) {
      const choiceLines = session.pendingChoice.options
        .map((opt, i) => `- Option ${i + 1}: ${opt.label}`)
        .join("\n");
      systemPrompt += [
        "\n\n[CHOICE MOMENT] Present these options to the player naturally in your next response.",
        "Do not list them mechanically — weave them into your dialogue as Elara would.",
        "Make each option sound like a natural suggestion or question:",
        choiceLines,
        "Wait for the player's verbal response before continuing.",
      ].join("\n");
    }

    console.log(`[WEBHOOK] System prompt length: ${systemPrompt.length} chars, preview: "${systemPrompt.slice(0, 200)}"`);

    // ── Assemble messages for Mistral ─────────────────────────────
    // Replace ElevenLabs system message with ours; pass conversation history as-is
    const mistralMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    console.log(`[WEBHOOK] Starting Mistral stream with ${mistralMessages.length} messages`);

    // ── Stream Mistral Large → SSE in real-time ─────────────────
    // Chunks are forwarded to ElevenLabs as they arrive from Mistral,
    // eliminating the wait for the full response. State updates
    // (sound cues, beat advancement, style tracking) run after the
    // stream completes — the response is already flowing to ElevenLabs.
    const encoder = new TextEncoder();
    const sseId = `chatcmpl-${Date.now()}`;
    const created = Math.floor(Date.now() / 1000);
    let fullText = "";

    // Capture variables needed by the post-stream state update closure
    const capturedConversationId = conversation_id;
    const capturedState = state;
    const capturedSession = session;
    const capturedConfig = config;
    const capturedPlayerText = playerText;

    const sseStream = new ReadableStream({
      async start(controller) {
        try {
          let first = true;
          let firstChunkTime: number | null = null;
          let chunkCount = 0;

          // Regex to strip [SOUND:x] markers before sending to ElevenLabs TTS.
          // Markers are collected from fullText post-stream for game state updates.
          const soundCueRe = /\[SOUND:[a-z_]+\]\s*/gi;

          for await (const chunk of streamMistralStory(
            process.env.MISTRAL_API_KEY!,
            mistralMessages,
          )) {
            if (first) {
              firstChunkTime = Date.now();
              console.log(`[WEBHOOK] First chunk received after ${firstChunkTime - requestStart}ms`);
            }
            fullText += chunk;
            chunkCount++;

            // Strip [SOUND:x] markers so ElevenLabs doesn't speak them aloud
            const cleanChunk = chunk.replace(soundCueRe, "");
            if (!cleanChunk) {
              first = false;
              continue; // chunk was entirely a sound marker — skip SSE emit
            }

            const data = {
              id: sseId,
              object: "chat.completion.chunk",
              created,
              model: "mistral-large-latest",
              choices: [{
                index: 0,
                delta: first
                  ? { role: "assistant" as const, content: cleanChunk }
                  : { content: cleanChunk },
                finish_reason: null,
              }],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            first = false;
          }

          console.log(`[WEBHOOK] Stream complete, total chunks=${chunkCount}, total response: ${fullText.length} chars, preview: "${fullText.slice(0, 200)}"`);

          // Finish chunk
          const finish = {
            id: sseId,
            object: "chat.completion.chunk",
            created,
            model: "mistral-large-latest",
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finish)}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();

          // ── Post-stream state updates (fire-and-forget) ──────────
          // The SSE response is already closed and flowing to ElevenLabs.
          // State updates run asynchronously so they don't block TTS.
          void performPostStreamUpdates(
            capturedConversationId,
            capturedState,
            capturedSession,
            capturedConfig,
            capturedPlayerText,
            fullText,
          );
        } catch (err) {
          const error = err as Error;
          console.error(`[WEBHOOK] ERROR inside SSE stream: ${error.message}`);
          console.error(error.stack);
          // Send a graceful fallback instead of controller.error() which kills
          // the ElevenLabs connection with no explanation.
          try {
            const fallback = {
              id: sseId, object: "chat.completion.chunk", created,
              model: "mistral-large-latest",
              choices: [{ index: 0, delta: { content: "... I need a moment. Let me gather my thoughts." }, finish_reason: null }],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(fallback)}\n\n`));
            const finish = {
              id: sseId, object: "chat.completion.chunk", created,
              model: "mistral-large-latest",
              choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finish)}\n\n`));
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch {
            controller.error(err);
          }
        }
      },
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error(`[WEBHOOK] ERROR: ${error.message}`);
    console.error(error.stack);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Post-stream state updates — runs after SSE response is sent.
 * Handles sound cue parsing, conversation history, beat advancement,
 * ending detection, choice detection, and style tracking.
 */
async function performPostStreamUpdates(
  conversationId: string,
  state: StoryState,
  session: SessionData,
  config: GameConfig,
  playerText: string,
  rawResponse: string,
): Promise<void> {
  console.log(`[WEBHOOK] performPostStreamUpdates starting for conversationId=${conversationId}`);
  try {
    // ── Parse sound cues from full accumulated response ─────────
    const { cleanText, cues } = parseSoundCues(rawResponse);
    console.log(`[WEBHOOK] Sound cues found: ${cues.length}${cues.length > 0 ? ` — [${cues.map((c) => c.soundId).join(", ")}]` : ""}`);

    // ── Update conversation history in state ──────────────────────
    const playerTurn: ConversationTurn = { role: "player", text: playerText, timestamp: Date.now() };
    const elaraTurn: ConversationTurn = { role: "elara", text: cleanText, timestamp: Date.now() };

    let nextState = {
      ...state,
      conversationHistory: [...state.conversationHistory, playerTurn, elaraTurn],
      elapsedSeconds: state.elapsedSeconds + 30, // rough approximation per turn
    };

    // ── Advance beat + check phase transition ─────────────────────
    const prevBeatIndex = nextState.currentBeatIndex;
    const prevPhaseIndex = nextState.currentPhaseIndex;
    nextState = advanceBeat(config, nextState);

    // If beats are exhausted in current phase, advance to next phase
    // (mirrors game-orchestrator's checkPhaseTransition logic)
    const beatAfterAdvance = getCurrentBeat(config, nextState);
    if (!beatAfterAdvance) {
      console.log(
        `[WEBHOOK] Phase ${nextState.currentPhaseIndex} beats exhausted (beatIndex=${nextState.currentBeatIndex}) — transitioning to next phase`,
      );
      nextState = advancePhase(config, nextState);
    }

    const beatAdvanced =
      nextState.currentBeatIndex !== prevBeatIndex || nextState.currentPhaseIndex !== prevPhaseIndex;
    console.log(
      `[WEBHOOK] Beat advanced: ${beatAdvanced} — phase=${prevPhaseIndex}→${nextState.currentPhaseIndex}, beat=${prevBeatIndex}→${nextState.currentBeatIndex}`,
    );

    // ── Check for ending (only in final phase — Phase 5, index 4) ──
    // Ending conditions include a default fallback with empty trigger that always matches.
    // Running this check in earlier phases would immediately end the game.
    const isInFinalPhase = nextState.currentPhaseIndex >= config.arc.phases.length - 1;
    const endingId = isInFinalPhase ? evaluateEndingCondition(config, nextState) : null;
    if (endingId) {
      console.log(`[WEBHOOK] Ending detected: endingId="${endingId}" — marking gameOver`);
      nextState = { ...nextState, endingId };
      updateSession(conversationId, {
        state: nextState,
        pendingSoundCues: cues.map((c) => ({ soundId: c.soundId, position: c.position })),
        gameOver: true,
      });
      return;
    }
    console.log(`[WEBHOOK] Ending check: ${isInFinalPhase ? "none (final phase, no conditions matched)" : `skipped (phase ${nextState.currentPhaseIndex}, not final)`}`);

    // ── Check for beat with choices — store for voice presentation next turn ──
    const nextBeat = getCurrentBeat(config, nextState);
    let pendingChoice = session.pendingChoice;
    if (nextBeat?.type === "choice" && nextBeat.options && !pendingChoice) {
      pendingChoice = {
        beatId: nextBeat.id,
        options: nextBeat.options.map((c) => ({
          id: c.id,
          label: c.label,
        })),
      };
      console.log(`[WEBHOOK] Choice detected: beatId="${nextBeat.id}", options=[${nextBeat.options.map((o) => o.label).join(", ")}]`);
    } else {
      console.log(`[WEBHOOK] Choice detected: none (nextBeat type="${nextBeat?.type ?? "null"}")`);
    }

    // ── Classify intent (async — for style tracker) ──────────────
    let nextStateWithStyle = nextState;
    try {
      console.log(`[WEBHOOK] Style tracking: running intent classification for playerText="${playerText.slice(0, 60)}"`);
      const intent = await intentParser.parse(playerText, config.prompts.system.intentClassifierPrompt);
      console.log(`[WEBHOOK] Style tracking: intent="${intent.intent}", emotionalRegister="${intent.emotionalRegister}", challengeLevel="${intent.challengeLevel}"`);
      const styleImport = await import("@/lib/style-tracker");
      nextStateWithStyle = styleImport.applyIntentScore(nextState, intent.emotionalRegister);
      console.log(`[WEBHOOK] Style tracking: applied — playerStyleScores=${JSON.stringify(nextStateWithStyle.playerStyleScores)}`);
    } catch (styleErr) {
      const styleError = styleErr as Error;
      console.error(`[WEBHOOK] Style tracking failed (non-critical): ${styleError.message}`);
    }

    updateSession(conversationId, {
      state: nextStateWithStyle,
      pendingChoice,
      pendingSoundCues: [
        ...(session.pendingSoundCues ?? []),
        ...cues.map((c) => ({ soundId: c.soundId, position: c.position })),
      ],
    });
    console.log(`[WEBHOOK] performPostStreamUpdates complete for conversationId=${conversationId}`);
  } catch (err) {
    const error = err as Error;
    console.error(`[WEBHOOK] ERROR in performPostStreamUpdates: ${error.message}`);
    console.error(error.stack);
  }
}

/**
 * Return an SSE-streamed OpenAI-compatible response.
 * ElevenLabs sends `stream: true` and expects `text/event-stream` with delta chunks.
 * We split by sentence boundaries so ElevenLabs can start TTS before the full response arrives.
 */
function openAiSSEResponse(content: string): Response {
  const encoder = new TextEncoder();
  const id = `chatcmpl-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);

  // Split into sentence-sized chunks for progressive TTS
  const sentences = content.match(/[^.!?]+[.!?]+[\s]*/g) ?? [content];

  const stream = new ReadableStream({
    start(controller) {
      // First chunk includes role
      const first = {
        id,
        object: "chat.completion.chunk",
        created,
        model: "mistral-large-latest",
        choices: [{ index: 0, delta: { role: "assistant", content: sentences[0] ?? "" }, finish_reason: null }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(first)}\n\n`));

      // Remaining sentence chunks
      for (let i = 1; i < sentences.length; i++) {
        const chunk = {
          id,
          object: "chat.completion.chunk",
          created,
          model: "mistral-large-latest",
          choices: [{ index: 0, delta: { content: sentences[i] }, finish_reason: null }],
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }

      // Finish chunk
      const finish = {
        id,
        object: "chat.completion.chunk",
        created,
        model: "mistral-large-latest",
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finish)}\n\n`));

      // Done signal
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
