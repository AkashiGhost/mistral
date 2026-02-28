// ─────────────────────────────────────────────
// ElevenLabs ConvAI — custom LLM webhook
// ElevenLabs sends the conversation history here; we inject our story
// system prompt, call Mistral Large, and return an OpenAI-compatible response.
// ElevenLabs then converts our text to Elara's voice.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { loadStory } from "@/lib/story-loader";
import {
  getSession,
  createSession,
  updateSession,
} from "@/lib/session-store";
import { initState, getCurrentBeat, advanceBeat, evaluateEndingCondition } from "@/lib/state-machine";
import { buildContext } from "@/lib/llm/context-builder";
import { parseSoundCues } from "@/lib/sound-cue-parser";
import { callMistralStory, MistralIntentParser } from "@/lib/llm/mistral-adapter";
import type { ConversationTurn } from "@/lib/types/story-state";

// Must be Node.js runtime — Edge does not support module-level Map persistence
export const runtime = "nodejs";

// Cache story config across requests (loaded once per warm instance)
let storyConfig: Awaited<ReturnType<typeof loadStory>> | null = null;
function getConfig() {
  if (!storyConfig) storyConfig = loadStory();
  return storyConfig;
}

const intentParser = new MistralIntentParser(process.env.MISTRAL_API_KEY!);

interface ElevenLabsMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ElevenLabsRequest {
  conversation_id: string;
  messages: ElevenLabsMessage[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ElevenLabsRequest;
    const { conversation_id, messages } = body;

    if (!conversation_id || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const config = getConfig();

    // Get or init session state
    let session = getSession(conversation_id);
    if (!session) {
      const initialState = initState(config);
      session = createSession(conversation_id, initialState);
    }

    if (session.gameOver) {
      return openAiResponse("The session has ended. Goodbye.");
    }

    // ── Extract player's latest message ──────────────────────────
    const userMessages = messages.filter((m) => m.role === "user");
    const playerText = String(userMessages[userMessages.length - 1]?.content ?? "").trim();

    // ── Build story system prompt ─────────────────────────────────
    const { state } = session;
    const currentPhaseIndex = state.currentPhaseIndex;
    const currentPhase = config.arc.phases[currentPhaseIndex];
    const currentBeat = getCurrentBeat(config, state);

    const { systemPrompt } = buildContext(config, state, currentPhase, currentBeat);

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
      return openAiResponse(cleanText);
    }

    // ── Check for beat with choices — surface to client via polling ──
    const nextBeat = getCurrentBeat(config, nextState);
    let pendingChoice = session.pendingChoice;
    if (nextBeat?.type === "choice" && nextBeat.choices && !pendingChoice) {
      pendingChoice = {
        beatId: nextBeat.id,
        choices: nextBeat.choices.map((c) => ({
          id: c.id,
          label: c.label,
          shortLabel: c.shortLabel ?? c.label,
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

    return openAiResponse(cleanText);
  } catch (err) {
    console.error("[/api/llm]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function openAiResponse(content: string) {
  return NextResponse.json({
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: "mistral-large-latest",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      },
    ],
  });
}
