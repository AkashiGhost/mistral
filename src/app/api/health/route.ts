import { NextResponse } from "next/server";
import { STORY_IDS } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
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
    stories: STORY_IDS,
  });
}
