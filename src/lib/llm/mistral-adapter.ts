// ─────────────────────────────────────────────
// Mistral Adapter — Large for story + Small for intent
// ─────────────────────────────────────────────

import { Mistral } from "@mistralai/mistralai";
import type { IntentParser } from "../types/llm";
import type { IntentResult, IntentType, EmotionalRegister, ChallengeLevel } from "../types/intent";

export const STORY_MODEL = "mistral-large-latest";
export const INTENT_MODEL = "mistral-small-latest";

// ─────────────────────────────────────────────
// Intent Parser — Mistral Small (fast + cheap)
// ─────────────────────────────────────────────

export class MistralIntentParser implements IntentParser {
  private client: Mistral;

  constructor(apiKey: string) {
    this.client = new Mistral({ apiKey });
  }

  async parse(playerText: string, intentClassifierPrompt?: string): Promise<IntentResult> {
    console.log(`[INTENT] parse called — input: "${playerText.slice(0, 100)}${playerText.length > 100 ? "..." : ""}"`);
    console.log(`[INTENT] Using ${intentClassifierPrompt ? "story-specific" : "default"} intent classifier prompt`);

    const defaultPrompt = `You are an intent classifier for a voice-based interactive story.
Classify the following player input. Return ONLY valid JSON, no markdown.

Player said: "${playerText}"

Return JSON:
{
  "intent": one of ["speak","ask_question","express_emotion","try_to_leave","look_around","silence","other"],
  "emotionalRegister": one of ["empathetic","analytical","nurturing","confrontational","neutral"],
  "keyPhrase": the most significant phrase from the input,
  "challengeLevel": one of ["low","medium","high"]
}`;

    // Story-specific prompts from YAML include the full classifier instructions
    // but need the player's input appended
    const prompt = intentClassifierPrompt
      ? `${intentClassifierPrompt}\n\nPlayer said: "${playerText}"\n\nReturn ONLY the JSON object.`
      : defaultPrompt;

    try {
      console.log(`[INTENT] Calling Mistral Small (${INTENT_MODEL}) for intent classification`);
      const response = await this.client.chat.complete({
        model: INTENT_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      });

      const text = String(response.choices?.[0]?.message?.content ?? "").trim();
      console.log(`[INTENT] Raw response from Mistral Small: "${text.slice(0, 300)}"`);

      const jsonStr = text.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      const parsed = JSON.parse(jsonStr);

      const result: IntentResult = {
        intent: (parsed.intent as IntentType) ?? "other",
        emotionalRegister: (parsed.emotionalRegister as EmotionalRegister) ?? "neutral",
        keyPhrase: (parsed.keyPhrase as string) ?? playerText,
        challengeLevel: (parsed.challengeLevel as ChallengeLevel) ?? "medium",
        rawInput: playerText,
      };
      console.log(`[INTENT] Parsed result: intent="${result.intent}", emotionalRegister="${result.emotionalRegister}", challengeLevel="${result.challengeLevel}", keyPhrase="${result.keyPhrase}"`);
      return result;
    } catch (err) {
      const error = err as Error;
      console.error(`[INTENT] Parse failed — ${error.message} — falling back to defaults`);
      return {
        intent: "other",
        emotionalRegister: "neutral",
        keyPhrase: playerText,
        challengeLevel: "medium",
        rawInput: playerText,
      };
    }
  }
}

// ─────────────────────────────────────────────
// Story call — called directly from API route
// ─────────────────────────────────────────────

export async function callMistralStory(
  apiKey: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): Promise<string> {
  const client = new Mistral({ apiKey });
  const response = await client.chat.complete({
    model: STORY_MODEL,
    messages,
    temperature: 0.85,
    maxTokens: 200, // Tighter responses encourage turn-taking
  });
  return String(response.choices?.[0]?.message?.content ?? "");
}

// ─────────────────────────────────────────────
// Streaming story call — yields text chunks as
// they arrive from Mistral for real-time SSE
// ─────────────────────────────────────────────

export async function* streamMistralStory(
  apiKey: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): AsyncGenerator<string> {
  console.log(`[MISTRAL] streamMistralStory called — model=${STORY_MODEL}, messageCount=${messages.length}, temperature=0.85, maxTokens=200`);

  const client = new Mistral({ apiKey });

  let stream;
  try {
    console.log(`[MISTRAL] Opening stream to Mistral API...`);
    stream = await client.chat.stream({
      model: STORY_MODEL,
      messages,
      temperature: 0.85,
      maxTokens: 200, // Tighter responses encourage turn-taking
    });
    console.log(`[MISTRAL] Stream opened successfully`);
  } catch (err) {
    const error = err as Error;
    console.error(`[MISTRAL] ERROR opening stream: ${error.message}`);
    console.error(error.stack);
    throw err;
  }

  let chunkCount = 0;
  let firstChunkLogged = false;

  try {
    for await (const event of stream) {
      const delta = event.data?.choices?.[0]?.delta;
      if (delta?.content && typeof delta.content === "string") {
        if (!firstChunkLogged) {
          console.log(`[MISTRAL] First chunk received — content: "${delta.content}"`);
          firstChunkLogged = true;
        }
        chunkCount++;
        yield delta.content;
      }
    }
  } catch (err) {
    const error = err as Error;
    console.error(`[MISTRAL] ERROR during stream iteration (after ${chunkCount} chunks): ${error.message}`);
    console.error(error.stack);
    throw err;
  }

  console.log(`[MISTRAL] streamMistralStory complete — totalChunksYielded=${chunkCount}`);
}
