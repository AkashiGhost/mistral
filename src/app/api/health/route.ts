import { NextResponse } from "next/server";
import { STORY_IDS, getGameConfig } from "@/lib/config-loader";

export const runtime = "nodejs";

export async function GET() {
  const stories: Record<string, string> = {};
  for (const id of STORY_IDS) {
    try {
      const config = getGameConfig(id);
      const phases = config.arc.phases.length;
      const beats = config.arc.phases.reduce(
        (sum, p) => sum + (p.beats?.length ?? 0),
        0,
      );
      stories[id] = `${phases} phases, ${beats} beats`;
    } catch {
      stories[id] = "failed to load";
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      mistral: process.env.MISTRAL_API_KEY ? "configured" : "missing",
      elevenlabs: process.env.ELEVENLABS_API_KEY ? "configured" : "missing",
      elevenlabs_agent: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
        ? "configured"
        : "missing",
    },
    stories,
  });
}
