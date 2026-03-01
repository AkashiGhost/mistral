// Stateless proxy: ElevenLabs → Mistral (raw fetch, no SDK)
//
// WHY raw fetch instead of @mistralai/mistralai SDK:
// The SDK transforms responses to camelCase (finishReason, promptTokens).
// ElevenLabs expects strict OpenAI format (finish_reason, prompt_tokens).
// Mistral's REST API IS OpenAI-compatible at the wire level — the SDK breaks that.

import { NextRequest } from "next/server";

export const runtime = "nodejs";

const MODEL = "ministral-8b-latest";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = body.messages ?? [];

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return new Response("MISTRAL_API_KEY not set", { status: 500 });
  }

  const mistralRes = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.85,
      max_tokens: 200,
      stream: true,
    }),
  });

  if (!mistralRes.ok) {
    const errText = await mistralRes.text().catch(() => "");
    console.error(`[LLM PROXY] Mistral API error: ${mistralRes.status} ${errText}`);
    return new Response(errText || "Mistral API error", { status: mistralRes.status });
  }

  // Pass through the raw SSE stream — already in OpenAI-compatible format
  return new Response(mistralRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
