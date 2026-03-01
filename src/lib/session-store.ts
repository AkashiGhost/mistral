// ─────────────────────────────────────────────
// Session store — in-memory, keyed by ElevenLabs conversation_id
// Lives in Node.js runtime (not Edge) so it persists across requests
// within the same warm Vercel function instance. Game sessions are
// 10-12 min max, so cold-start reset is acceptable.
// ─────────────────────────────────────────────

import type { StoryState } from "./types/story-state";
import type { ChoicePromptPayload } from "./types/llm";
import { DEFAULT_STORY_ID, type StoryId } from "./config-loader";

export interface SessionData {
  storyId: StoryId;
  state: StoryState;
  pendingChoice: ChoicePromptPayload | null;
  pendingSoundCues: Array<{ soundId: string; position: number }>;
  gameOver: boolean;
  createdAt: number;
}

const sessions = new Map<string, SessionData>();

// 30 min TTL — auto-evict stale sessions
const SESSION_TTL_MS = 30 * 60 * 1000;

function evictStale() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

export function getSession(conversationId: string): SessionData | undefined {
  const session = sessions.get(conversationId);
  console.log(`[SESSION] Get: cid=${conversationId}, found=${session !== undefined}`);
  return session;
}

export function createSession(conversationId: string, initialState: StoryState, storyId: StoryId = DEFAULT_STORY_ID): SessionData {
  evictStale();
  const session: SessionData = {
    storyId,
    state: initialState,
    pendingChoice: null,
    pendingSoundCues: [],
    gameOver: false,
    createdAt: Date.now(),
  };
  sessions.set(conversationId, session);
  console.log(`[SESSION] Create: cid=${conversationId}`);
  console.log(`[SESSION] Active sessions: ${sessions.size}`);
  return session;
}

export function updateSession(
  conversationId: string,
  updates: Partial<SessionData>,
): void {
  const existing = sessions.get(conversationId);
  if (existing) {
    console.log(`[SESSION] Update: cid=${conversationId}, changes=${JSON.stringify(Object.keys(updates))}`);
    sessions.set(conversationId, { ...existing, ...updates });
  }
}

export function clearPendingChoice(conversationId: string): void {
  const existing = sessions.get(conversationId);
  if (existing) {
    sessions.set(conversationId, { ...existing, pendingChoice: null });
  }
}

export function clearSoundCues(conversationId: string): void {
  const existing = sessions.get(conversationId);
  if (existing) {
    sessions.set(conversationId, { ...existing, pendingSoundCues: [] });
  }
}
