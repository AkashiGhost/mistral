// ─────────────────────────────────────────────
// Choice selection endpoint
// Client calls POST /api/choice when player selects a narrative choice.
// We apply the choice to game state and clear the pending choice.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession, clearPendingChoice } from "@/lib/session-store";
import { getGameConfig } from "@/lib/config-loader";
import { resolveChoice } from "@/lib/state-machine";
import type { GameConfig } from "@/lib/types/game-config";

export const runtime = "nodejs";

let storyConfig: GameConfig | null = null;
function getConfig(): GameConfig {
  if (!storyConfig) storyConfig = getGameConfig();
  return storyConfig;
}

export async function POST(req: NextRequest) {
  const { conversationId, beatId, optionId } = (await req.json()) as {
    conversationId?: string;
    beatId?: string;
    optionId?: string;
  };

  if (!conversationId || !beatId || !optionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const session = getSession(conversationId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const config = getConfig();

  // Find the selected option in the config
  const phase = config.arc.phases[session.state.currentPhaseIndex];
  const beat = phase?.beats?.find((b) => b.id === beatId);
  const option = beat?.options?.find((c) => c.id === optionId);

  if (!option) {
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  const nextState = resolveChoice(session.state, beatId, optionId, option);

  updateSession(conversationId, {
    state: nextState,
    pendingChoice: null,
  });

  return NextResponse.json({ ok: true });
}
