import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  console.log("[SIGNED-URL] Request received");

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    console.error(`[SIGNED-URL] Missing ElevenLabs config: apiKey=${!!apiKey}, agentId=${!!agentId}`);
    return NextResponse.json({ error: "Missing ElevenLabs config" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { "xi-api-key": apiKey } }
    );
  } catch (err) {
    console.error("[SIGNED-URL] Network error calling ElevenLabs API:", err);
    return NextResponse.json({ error: "Failed to reach ElevenLabs API" }, { status: 502 });
  }

  if (!res.ok) {
    console.error(`[SIGNED-URL] ElevenLabs API error: status=${res.status}`);
    return NextResponse.json({ error: "Failed to get signed URL" }, { status: res.status });
  }

  console.log(`[SIGNED-URL] ElevenLabs API success: status=${res.status}`);

  const data = await res.json();
  return NextResponse.json({ signedUrl: data.signed_url });
}
