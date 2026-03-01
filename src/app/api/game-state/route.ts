// ─────────────────────────────────────────────
// Game state polling endpoint
// Client calls GET /api/game-state?cid=<conversationId> after each
// ElevenLabs onMessage to fetch choices, phase info, sound cues.
// POST /api/game-state initialises the session (called on ElevenLabs connect).
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  createSession,
  clearPendingChoice,
  clearSoundCues,
  updateSession,
} from "@/lib/session-store";
import { getGameConfig, DEFAULT_STORY_ID, type StoryId } from "@/lib/config-loader";
import { initState } from "@/lib/state-machine";

export const runtime = "nodejs";

// GET /api/game-state?cid=<conversationId>
export async function GET(req: NextRequest) {
  const cid = req.nextUrl.searchParams.get("cid");
  if (!cid) {
    console.error("[GAME-STATE] GET missing cid parameter");
    return NextResponse.json({ error: "Missing cid" }, { status: 400 });
  }

  const session = getSession(cid);
  console.log(`[GAME-STATE] GET for cid=${cid}, found=${session !== undefined}`);

  if (!session) {
    return NextResponse.json({
      phase: 0,
      beatIndex: 0,
      trustLevel: 3,
      activeChoice: null,
      soundCues: [],
      gameOver: false,
    });
  }

  const { state, pendingChoice, pendingSoundCues, gameOver } = session;

  // Drain sound cues — client clears after receiving
  const soundCues = [...(pendingSoundCues ?? [])];
  if (soundCues.length > 0) clearSoundCues(cid);

  console.log(
    `[GAME-STATE] GET returning: phase=${state.currentPhaseIndex}, beat=${state.currentBeatIndex}, ` +
    `trust=${state.elara.trustLevel}, gameOver=${gameOver}, ` +
    `choice=${pendingChoice?.beatId ?? 'none'}, soundCues=[${soundCues.map((c) => c.soundId).join(', ')}]`,
  );

  return NextResponse.json({
    phase: state.currentPhaseIndex,
    beatIndex: state.currentBeatIndex,
    elapsedSeconds: state.elapsedSeconds,
    trustLevel: state.elara.trustLevel,
    emotionalState: state.elara.emotionalState,
    activeChoice: pendingChoice ?? null,
    soundCues,
    gameOver,
    endingId: state.endingId ?? null,
  });
}

// POST /api/game-state — initialise or reset a session
export async function POST(req: NextRequest) {
  let body: { conversationId?: string; storyId?: StoryId };
  try {
    body = (await req.json()) as { conversationId?: string; storyId?: StoryId };
  } catch (err) {
    console.error("[GAME-STATE] POST failed to parse request body:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { conversationId, storyId } = body;
  if (!conversationId) {
    console.error("[GAME-STATE] POST missing conversationId");
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const resolvedStoryId = storyId ?? DEFAULT_STORY_ID;
  console.log(`[GAME-STATE] POST init for cid=${conversationId}, storyId=${resolvedStoryId}`);

  let config;
  try {
    config = getGameConfig(resolvedStoryId);
  } catch (err) {
    console.error(`[GAME-STATE] Failed to load story "${resolvedStoryId}":`, err);
    return NextResponse.json(
      { error: `Story "${resolvedStoryId}" not found or failed to load` },
      { status: 404 },
    );
  }
  const existingSession = getSession(conversationId);

  if (!existingSession) {
    const initialState = initState(config);
    createSession(conversationId, initialState, resolvedStoryId);
    console.log(`[GAME-STATE] POST created new session for cid=${conversationId}`);
  } else {
    // Re-init (e.g., after ElevenLabs reconnect)
    console.log(`[GAME-STATE] POST re-initialising existing session for cid=${conversationId}`);
    const initialState = initState(config);
    updateSession(conversationId, {
      state: initialState,
      pendingChoice: null,
      pendingSoundCues: [],
      gameOver: false,
    });
  }

  return NextResponse.json({ ok: true });
}
