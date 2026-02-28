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
import { loadStory } from "@/lib/story-loader";
import { initState } from "@/lib/state-machine";

export const runtime = "nodejs";

let storyConfig: ReturnType<typeof loadStory> | null = null;
function getConfig() {
  if (!storyConfig) storyConfig = loadStory();
  return storyConfig;
}

// GET /api/game-state?cid=<conversationId>
export async function GET(req: NextRequest) {
  const cid = req.nextUrl.searchParams.get("cid");
  if (!cid) return NextResponse.json({ error: "Missing cid" }, { status: 400 });

  const session = getSession(cid);
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
  const { conversationId } = (await req.json()) as { conversationId?: string };
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const config = getConfig();
  const existingSession = getSession(conversationId);

  if (!existingSession) {
    const initialState = initState(config);
    createSession(conversationId, initialState);
  } else {
    // Re-init (e.g., after ElevenLabs reconnect)
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
