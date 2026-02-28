// Redirect — ElevenLabs calls /api/llm/chat/completions (auto-appended)
// This file handles direct calls to /api/llm as fallback

import { NextRequest } from "next/server";

// Next.js requires route segment config to be a direct declaration (not re-exported)
export const runtime = "nodejs";

import { POST as chatCompletionsPost } from "./chat/completions/route";

export async function POST(req: NextRequest) {
  console.log("[WEBHOOK] WARNING: Fallback route /api/llm was hit directly — ElevenLabs called /api/llm instead of /api/llm/chat/completions. Check Server URL configuration in ElevenLabs ConvAI agent settings.");
  return chatCompletionsPost(req);
}
