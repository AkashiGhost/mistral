// Redirect — ElevenLabs calls /api/llm/chat/completions (auto-appended)
// This file handles direct calls to /api/llm as fallback

// Next.js requires route segment config to be a direct declaration (not re-exported)
export const runtime = "nodejs";

export { POST } from "./chat/completions/route";
