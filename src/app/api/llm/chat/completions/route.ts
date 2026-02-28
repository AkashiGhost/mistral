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
import { getGameConfig } from "@/lib/config-loader";
import {
  getSession,
  createSession,
  updateSession,
} from "@/lib/session-store";
import { initState, getCurrentBeat, advanceBeat, evaluateEndingCondition, resolveChoice } from "@/lib/state-machine";
import { buildContext } from "@/lib/llm/context-builder";
import { parseSoundCues } from "@/lib/sound-cue-parser";
import { callMistralStory, MistralIntentParser } from "@/lib/llm/mistral-adapter";
import type { ConversationTurn } from "@/lib/types/story-state";
import type { GameConfig, Beat, ChoiceOption } from "@/lib/types/game-config";

// Must be Node.js runtime — Edge does not support module-level Map persistence
export const runtime = "nodejs";

// Cache story config across requests (loaded once per warm instance)
let storyConfig: GameConfig | null = null;
function getConfig(): GameConfig {
  if (!storyConfig) storyConfig = getGameConfig();
  return storyConfig;
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
  elevenlabs_extra_body?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LLMWebhookRequest;
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Extract conversation_id from available sources (priority order)
    let conversation_id = body.conversation_id
      ?? (body.elevenlabs_extra_body?.conversation_id as string | undefined)
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
    }

    const config = getConfig();

    // Get or init session state
    let session = getSession(conversation_id);
    if (!session) {
      const initialState = initState(config);
      session = createSession(conversation_id, initialState);
    }

    if (session.gameOver) {
      return openAiSSEResponse("The session has ended. Goodbye.");
    }

    // ── Extract player's latest message ──────────────────────────
    const userMessages = messages.filter((m) => m.role === "user");
    const playerText = String(userMessages[userMessages.length - 1]?.content ?? "").trim();

    // ── If there's a pending voice choice, match the player's response ──
    let { state } = session;
    const currentPendingChoice = session.pendingChoice;
    if (currentPendingChoice && playerText) {
      const choiceOptions = currentPendingChoice.options;
      const matchedOption = choiceOptions.find((opt) => {
        const words = opt.label.toLowerCase().split(/\s+/);
        const playerLower = playerText.toLowerCase();
        return words.some((word) => word.length > 3 && playerLower.includes(word));
      });

      if (matchedOption) {
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
      }
    }

    // ── Build story system prompt ─────────────────────────────────
    const currentPhaseIndex = state.currentPhaseIndex;
    const currentPhase = config.arc.phases[currentPhaseIndex];
    const currentBeat = getCurrentBeat(config, state);

    let { systemPrompt } = buildContext(config, state, currentPhase, currentBeat);

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

    // ── Assemble messages for Mistral ─────────────────────────────
    // Replace ElevenLabs system message with ours; pass conversation history as-is
    const mistralMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    // ── Call Mistral Large ────────────────────────────────────────
    const rawResponse = await callMistralStory(
      process.env.MISTRAL_API_KEY!,
      mistralMessages,
    );

    // ── Parse sound cues from response ───────────────────────────
    const { cleanText, cues } = parseSoundCues(rawResponse);

    // ── Update conversation history in state ──────────────────────
    const playerTurn: ConversationTurn = { role: "player", text: playerText, timestamp: Date.now() };
    const elaraTurn: ConversationTurn = { role: "elara", text: cleanText, timestamp: Date.now() };

    let nextState = {
      ...state,
      conversationHistory: [...state.conversationHistory, playerTurn, elaraTurn],
      elapsedSeconds: state.elapsedSeconds + 30, // rough approximation per turn
    };

    // ── Advance beat ──────────────────────────────────────────────
    nextState = advanceBeat(config, nextState);

    // ── Check for ending ──────────────────────────────────────────
    const endingId = evaluateEndingCondition(config, nextState);
    if (endingId) {
      nextState = { ...nextState, endingId };
      updateSession(conversation_id, {
        state: nextState,
        pendingSoundCues: cues.map((c) => ({ soundId: c.soundId, position: c.position })),
        gameOver: true,
      });
      return openAiSSEResponse(cleanText);
    }

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
    }

    // ── Classify intent (async, not on hot path — for style tracker) ──
    let nextStateWithStyle = nextState;
    try {
      const intent = await intentParser.parse(playerText);
      const styleImport = await import("@/lib/style-tracker");
      nextStateWithStyle = styleImport.applyIntentScore(nextState, intent.emotionalRegister);
    } catch {
      // Style tracking is non-critical
    }

    updateSession(conversation_id, {
      state: nextStateWithStyle,
      pendingChoice,
      pendingSoundCues: [
        ...(session.pendingSoundCues ?? []),
        ...cues.map((c) => ({ soundId: c.soundId, position: c.position })),
      ],
    });

    return openAiSSEResponse(cleanText);
  } catch (err) {
    console.error("[/api/llm/chat/completions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
