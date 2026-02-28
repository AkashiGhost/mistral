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
  let body: { conversationId?: string; beatId?: string; optionId?: string };
  try {
    body = (await req.json()) as { conversationId?: string; beatId?: string; optionId?: string };
  } catch (err) {
    console.error("[CHOICE] Failed to parse request body:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { conversationId, beatId, optionId } = body;

  if (!conversationId || !beatId || !optionId) {
    console.error(`[CHOICE] Missing required fields: cid=${conversationId ?? 'undefined'}, beat=${beatId ?? 'undefined'}, option=${optionId ?? 'undefined'}`);
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  console.log(`[CHOICE] Received: cid=${conversationId}, beat=${beatId}, option=${optionId}`);

  const session = getSession(conversationId);
  if (!session) {
    console.error(`[CHOICE] Session not found for cid=${conversationId}`);
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const config = getConfig();

  // Find the selected option in the config
  const phase = config.arc.phases[session.state.currentPhaseIndex];
  const beat = phase?.beats?.find((b) => b.id === beatId);
  const option = beat?.options?.find((c) => c.id === optionId);

  if (!option) {
    console.error(`[CHOICE] Option not found: beat=${beatId}, option=${optionId}, phase=${session.state.currentPhaseIndex}`);
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  const nextState = resolveChoice(session.state, beatId, optionId, option);

  console.log(
    `[CHOICE] Applied: cid=${conversationId}, trust=${session.state.elara.trustLevel}→${nextState.elara.trustLevel}, ` +
    `styleScores=${JSON.stringify(nextState.playerStyleScores)}`,
  );

  updateSession(conversationId, {
    state: nextState,
    pendingChoice: null,
  });

  return NextResponse.json({ ok: true });
}
