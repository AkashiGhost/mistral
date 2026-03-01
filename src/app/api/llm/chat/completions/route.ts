// ─────────────────────────────────────────────
// ElevenLabs ConvAI — custom LLM webhook
// ElevenLabs sends the conversation history here; we inject our story
// system prompt, call Mistral Large, and return an OpenAI-compatible response.
// ElevenLabs then converts our text to the character's voice.
//
// ElevenLabs auto-appends /chat/completions to the Server URL,
// so this route lives at /api/llm/chat/completions.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGameConfig, DEFAULT_STORY_ID, type StoryId } from "@/lib/config-loader";
import {
  getSession,
  createSession,
  updateSession,
} from "@/lib/session-store";
import { initState, getCurrentBeat, advanceBeat, advancePhase, evaluateEndingCondition, resolveChoice } from "@/lib/state-machine";
import { buildContext } from "@/lib/llm/context-builder";
import { parseSoundCues } from "@/lib/sound-cue-parser";
import { streamMistralStory } from "@/lib/llm/mistral-adapter";
import type { ConversationTurn, StoryState } from "@/lib/types/story-state";
import type { SessionData } from "@/lib/session-store";
import type { GameConfig, Beat, ChoiceOption } from "@/lib/types/game-config";

// Must be Node.js runtime — Edge does not support module-level Map persistence
export const runtime = "nodejs";

// Story configs are cached inside getGameConfig() per storyId
function getConfig(storyId?: StoryId): GameConfig {
  return getGameConfig(storyId);
}

const WebhookMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const WebhookRequestSchema = z.object({
  messages: z.array(WebhookMessageSchema).min(1, "At least one message required"),
  model: z.string().optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional(),
  conversation_id: z.string().optional(),
  // ElevenLabs renames "custom_llm_extra_body" from the client SDK to
  // "elevenlabs_extra_body" in the webhook payload. Accept both field names
  // for resilience — the client SDK sends as custom_llm_extra_body at session
  // init, but the ElevenLabs server forwards it as elevenlabs_extra_body.
  elevenlabs_extra_body: z.record(z.string(), z.unknown()).optional(),
  custom_llm_extra_body: z.record(z.string(), z.unknown()).optional(),
});

// Derive types from schemas
type LLMWebhookMessage = z.infer<typeof WebhookMessageSchema>;
type LLMWebhookRequest = z.infer<typeof WebhookRequestSchema>;

export async function POST(req: NextRequest) {
  const requestStart = Date.now();
  console.log(`[WEBHOOK] === NEW REQUEST === timestamp=${new Date(requestStart).toISOString()}`);

  try {
    // ── Parse & validate incoming payload ──────────────────────
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch (parseErr) {
      const parseError = parseErr as Error;
      console.error(`[WEBHOOK] JSON parse failed: ${parseError.message}`);
      return NextResponse.json(
        { error: "Invalid JSON", detail: parseError.message },
        { status: 400 },
      );
    }

    const parseResult = WebhookRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error(`[WEBHOOK] Payload validation failed:`, {
        errors: parseResult.error.issues,
        rawKeys: typeof rawBody === "object" && rawBody !== null ? Object.keys(rawBody) : "not-object",
      });
      return NextResponse.json(
        { error: "Invalid payload", issues: parseResult.error.issues.map(i => `${i.path.join(".")}: ${i.message}`) },
        { status: 400 },
      );
    }
    const body = parseResult.data;

    // ── Log raw body keys BEFORE any extraction (diagnostic) ────
    const rawKeys = typeof rawBody === "object" && rawBody !== null ? Object.keys(rawBody) : [];
    console.log(`[WEBHOOK] Raw body top-level keys: [${rawKeys.join(", ")}]`);

    // ── Log full request shape ───────────────────────────────────
    const messageSummary = body.messages.map((m) => ({
      role: m.role,
      contentLength: m.content.length,
    }));
    const elevenLabsSystemPrompt = body.messages.find((m) => m.role === "system")?.content ?? "";
    console.log(`[WEBHOOK] Body parsed: messageCount=${body.messages.length}, stream=${body.stream ?? false}`);
    console.log(`[WEBHOOK] Messages breakdown:`, JSON.stringify(messageSummary));
    console.log(`[WEBHOOK] ElevenLabs system prompt preview (first 200): "${elevenLabsSystemPrompt.slice(0, 200)}"`);
    console.log(`[WEBHOOK] conversation_id from body: ${body.conversation_id ?? "(none)"}`);

    // ── Resolve extra body — ElevenLabs uses "elevenlabs_extra_body" in webhook ──
    // The client SDK sends "customLlmExtraBody" at session init, but the
    // ElevenLabs server renames it to "elevenlabs_extra_body" when forwarding
    // to the webhook. Accept both for resilience.
    const extraBody = body.elevenlabs_extra_body ?? body.custom_llm_extra_body ?? {};
    console.log(`[WEBHOOK] elevenlabs_extra_body present: ${!!body.elevenlabs_extra_body}, custom_llm_extra_body present: ${!!body.custom_llm_extra_body}`);
    console.log(`[WEBHOOK] Resolved extraBody: ${JSON.stringify(extraBody)}`);

    const { messages } = body;

    // ── Resolve session ID — the key that MUST match frontend + webhook ──
    // Priority:
    // 1. session_id from elevenlabs_extra_body (set by client, passed through ElevenLabs)
    // 2. conversation_id from body (ElevenLabs might add this in future)
    // 3. conversation_id from extraBody
    // 4. Auto-generated fallback (last resort — causes split brain if frontend uses different ID)
    const explicitSessionId = extraBody.session_id as string | undefined;
    let conversation_id = explicitSessionId
      ?? body.conversation_id
      ?? (extraBody.conversation_id as string | undefined)
      ?? undefined;

    // Determine story ID early — needed for fallback conversation_id generation.
    const explicitStoryId = extraBody.story_id as StoryId | undefined;
    const hashStoryId = explicitStoryId ?? DEFAULT_STORY_ID;

    // Fallback: auto-generate from first user message + storyId (should rarely happen
    // now that client sends session_id, but kept for resilience)
    if (!conversation_id) {
      const userMsgs = messages.filter(m => m.role === "user");
      const firstUserMsg = userMsgs[0]?.content ?? "";
      const hash = Buffer.from(`${hashStoryId}:${firstUserMsg}`).toString("base64").slice(0, 24);
      conversation_id = `auto-${hash}`;
      console.warn(`[WEBHOOK] ⚠ No session_id or conversation_id — auto-generated: ${conversation_id}`);
    } else {
      console.log(`[WEBHOOK] Session ID resolved: ${conversation_id} (source: ${explicitSessionId ? "session_id" : "conversation_id"})`);
    }

    // Story ID resolution priority:
    // 1. Explicit from request (elevenlabs_extra_body.story_id)
    // 2. From existing session (if player already started this conversation)
    // 3. DEFAULT_STORY_ID as absolute last resort
    const existingSession = conversation_id ? getSession(conversation_id) : undefined;
    const requestStoryId = explicitStoryId
      ?? existingSession?.storyId
      ?? DEFAULT_STORY_ID;

    if (!explicitStoryId) {
      console.warn(`[WEBHOOK] ⚠ story_id MISSING from extra body! Falling back to: "${requestStoryId}" (source: ${existingSession?.storyId ? "existing session" : "DEFAULT"})`);
      console.warn(`[WEBHOOK] ⚠ Raw body keys: [${rawKeys.join(", ")}] — expected "elevenlabs_extra_body" or "custom_llm_extra_body"`);
    }
    console.log(`[WEBHOOK] requestStoryId="${requestStoryId}" (from extraBody: ${JSON.stringify(extraBody)})`);

    // Get or init session state
    let session = getSession(conversation_id);
    const sessionWasNew = !session;
    // ALWAYS prefer the explicitly-requested story_id over a cached session's storyId.
    // Session collision can happen when auto-generated conversation_ids match
    // (e.g. player says "Hello" in two different stories → same hash → same session).
    // The requestStoryId from custom_llm_extra_body is the ground truth.
    const storyId = requestStoryId;
    console.log(`[WEBHOOK] Using storyId="${storyId}" (request="${requestStoryId}", session="${session?.storyId ?? "none"}", new=${sessionWasNew})`);
    let config: GameConfig;
    try {
      config = getConfig(storyId);
    } catch (cfgErr) {
      console.error(`[WEBHOOK] Failed to load story "${storyId}":`, cfgErr);
      return openAiSSEResponse("I'm sorry, I cannot find that story right now. Please try again.");
    }
    // Create a new session if: no session exists, OR the session belongs to a different story
    // (session collision from auto-generated conversation_id).
    if (!session || session.storyId !== storyId) {
      if (session && session.storyId !== storyId) {
        console.warn(`[WEBHOOK] SESSION COLLISION: existing session storyId="${session.storyId}" but request wants "${storyId}" — creating fresh session`);
      }
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
    // This happens when the previous turn detected a choice beat. The character
    // should present the options verbally so the player can respond by voice.
    if (session.pendingChoice) {
      const choiceLines = session.pendingChoice.options
        .map((opt, i) => `- Option ${i + 1}: ${opt.label}`)
        .join("\n");
      const narratorChar = config.characters.find(c => c.role === "narrator") ?? config.characters[0];
      const charName = narratorChar?.name ?? "the character";
      systemPrompt += [
        "\n\n[CHOICE MOMENT] Present these options to the player naturally in your next response.",
        `Do not list them mechanically — weave them into your dialogue as ${charName} would.`,
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
        let chunkCount = 0;
        try {
          let first = true;
          let firstChunkTime: number | null = null;

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
          console.error(`[WEBHOOK] ERROR inside SSE stream:`, {
            errorMessage: error.message,
            errorName: error.name,
            stack: error.stack,
            fullTextSoFar: fullText.slice(0, 200),
            chunksEmitted: chunkCount,
          });
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
    console.error(`[WEBHOOK] UNHANDLED ERROR:`, {
      errorMessage: error.message,
      errorName: error.name,
      stack: error.stack,
      elapsed: `${Date.now() - requestStart}ms`,
    });
    // Return an in-character SSE fallback so ElevenLabs doesn't use its dashboard prompt
    return openAiSSEResponse("... Give me a moment. Something feels off.");
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
    const aiTurn: ConversationTurn = { role: "elara", text: cleanText, timestamp: Date.now() };

    let nextState = {
      ...state,
      conversationHistory: [...state.conversationHistory, playerTurn, aiTurn],
      elapsedSeconds: state.elapsedSeconds + 30, // rough approximation per turn
    };

    // ── Advance beat + check phase transition ─────────────────────
    // Don't advance past a choice beat until the player has resolved it.
    // When a choice is pending (session.pendingChoice is set), the game
    // holds on the current beat so the AI keeps presenting the choice
    // until the player picks an option.
    const prevBeatIndex = nextState.currentBeatIndex;
    const prevPhaseIndex = nextState.currentPhaseIndex;

    if (session.pendingChoice) {
      console.log(
        `[WEBHOOK] Beat NOT advanced — pendingChoice for beatId="${session.pendingChoice.beatId}" still unresolved`,
      );
    } else {
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
    }

    const beatAdvanced =
      nextState.currentBeatIndex !== prevBeatIndex || nextState.currentPhaseIndex !== prevPhaseIndex;
    console.log(
      `[WEBHOOK] Beat advanced: ${beatAdvanced} — phase=${prevPhaseIndex}→${nextState.currentPhaseIndex}, beat=${prevBeatIndex}→${nextState.currentBeatIndex}`,
    );

    // ── Check for game end ─────────────────────────────────────────
    // Two ways the game ends:
    // 1. advancePhase() ran out of phases → state.status = "ended"
    // 2. Final phase + ending condition matches → specific ending triggered
    if (nextState.status === "ended") {
      const endingId = evaluateEndingCondition(config, nextState) ?? "default";
      console.log(`[WEBHOOK] Game status=ended (phases exhausted) — endingId="${endingId}", marking gameOver`);
      nextState = { ...nextState, endingId };
      updateSession(conversationId, {
        state: nextState,
        pendingSoundCues: cues.map((c) => ({ soundId: c.soundId, position: c.position })),
        gameOver: true,
      });
      return;
    }

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

    // ── Style tracking via intent classification — DISABLED ──────
    // Mistral Small intent classification adds 3-5s of network latency.
    // On Vercel Hobby (10s timeout), this pushes the total function time
    // past the limit, causing Vercel to kill the process mid-response.
    // The TCP teardown makes ElevenLabs see an incomplete SSE stream,
    // so the player hears nothing.
    //
    // Style tracking is nice-to-have (affects revelation variant at Phase 4),
    // but gameplay works without it. Re-enable when on Vercel Pro (60s timeout)
    // or when moved to a background job.
    console.log(`[WEBHOOK] Style tracking: SKIPPED (Vercel Hobby timeout constraint)`);

    updateSession(conversationId, {
      state: nextState,
      pendingChoice,
      pendingSoundCues: [
        ...(session.pendingSoundCues ?? []),
        ...cues.map((c) => ({ soundId: c.soundId, position: c.position })),
      ],
    });
    console.log(`[WEBHOOK] performPostStreamUpdates complete for conversationId=${conversationId}`);
  } catch (err) {
    const error = err as Error;
    console.error(`[WEBHOOK] ERROR in performPostStreamUpdates:`, {
      errorMessage: error.message,
      errorName: error.name,
      stack: error.stack,
      conversationId,
      playerText: playerText.slice(0, 100),
      responseLength: rawResponse.length,
      currentPhase: state.currentPhaseIndex,
      currentBeat: state.currentBeatIndex,
    });
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
