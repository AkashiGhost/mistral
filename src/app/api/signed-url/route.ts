import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Fetches a WebRTC conversation token from ElevenLabs using the server-side API key.
 * The client passes this token to startSession({ conversationToken }) instead of
 * using agentId directly (which fails if the agent has auth enabled).
 */
export async function GET() {
  console.log("[CONV-TOKEN] Request received");

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    console.error(`[CONV-TOKEN] Missing ElevenLabs config: apiKey=${!!apiKey}, agentId=${!!agentId}`);
    return NextResponse.json({ error: "Missing ElevenLabs config" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { "xi-api-key": apiKey } }
    );
  } catch (err) {
    console.error("[CONV-TOKEN] Network error calling ElevenLabs API:", err);
    return NextResponse.json({ error: "Failed to reach ElevenLabs API" }, { status: 502 });
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[CONV-TOKEN] ElevenLabs API error: status=${res.status}, body=${body}`);
    return NextResponse.json({ error: "Failed to get conversation token" }, { status: res.status });
  }

  const data = await res.json();
  console.log(`[CONV-TOKEN] ElevenLabs API success: hasSignedUrl=${!!data.signed_url}`);

  return NextResponse.json({ signedUrl: data.signed_url });
}
