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

  async parse(playerText: string): Promise<IntentResult> {
    const prompt = `You are an intent classifier for a voice-based horror therapy game.
The player is a therapist speaking to a patient named Elara.

Classify the following player input. Return ONLY valid JSON, no markdown.

Player said: "${playerText}"

Return JSON:
{
  "intent": one of ["speak_to_elara","ask_question","express_emotion","try_to_leave","try_phone","try_call_help","try_end_session","stand_up","look_around","silence","other"],
  "emotionalRegister": one of ["empathetic","analytical","nurturing","confrontational","neutral"],
  "keyPhrase": the most significant phrase from the input,
  "challengeLevel": one of ["low","medium","high"]
}`;

    try {
      const response = await this.client.chat.complete({
        model: INTENT_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      });

      const text = String(response.choices?.[0]?.message?.content ?? "").trim();
      const jsonStr = text.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      const parsed = JSON.parse(jsonStr);

      return {
        intent: (parsed.intent as IntentType) ?? "other",
        emotionalRegister: (parsed.emotionalRegister as EmotionalRegister) ?? "neutral",
        keyPhrase: (parsed.keyPhrase as string) ?? playerText,
        challengeLevel: (parsed.challengeLevel as ChallengeLevel) ?? "medium",
        rawInput: playerText,
      };
    } catch {
      return {
        intent: "speak_to_elara",
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
    maxTokens: 300,
  });
  return String(response.choices?.[0]?.message?.content ?? "");
}
