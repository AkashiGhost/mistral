"use client";

import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useConversation } from "@elevenlabs/react";
import { DEFAULT_STORY_ID } from "@/lib/constants";
import { getStoryPrompt, getFirstMessage } from "@/lib/story-prompts";

// ─────────────────────────────────────────────
// Game context — ElevenLabs ConvAI voice wrapper
// ElevenLabs calls Mistral directly via system prompt override.
// No server polling, no session IDs, no choice API.
// ─────────────────────────────────────────────

export interface TranscriptEntry {
  source: "ai" | "user";
  text: string;
}

interface GameContextValue {
  phase: number;
  elapsedSeconds: number;
  status: "idle" | "connecting" | "playing" | "ended" | "error";
  lastAiText: string;
  hasAiSpoken: boolean;
  /** Whether the AI character is currently speaking (ElevenLabs TTS) */
  isSpeaking: boolean;
  /** Whether the game is paused */
  isPaused: boolean;
  /** Human-readable error message when status is "error" */
  errorMessage: string | null;
  /** Accumulated conversation transcript */
  transcript: TranscriptEntry[];
  startSession: (storyId?: string) => Promise<void>;
  endSession: () => Promise<void>;
  togglePause: () => void;
  conversationId: string | null;
}

type UIState = {
  phase: number;
  elapsedSeconds: number;
  status: "idle" | "connecting" | "playing" | "ended" | "error";
  lastAiText: string;
  hasAiSpoken: boolean;
  isPaused: boolean;
  errorMessage: string | null;
  conversationId: string | null;
  transcript: TranscriptEntry[];
};

type UIAction =
  | { type: "SET_STATUS"; status: UIState["status"] }
  | { type: "SET_CONVERSATION_ID"; id: string | null }
  | { type: "AI_TEXT"; text: string }
  | { type: "GAME_OVER" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "TICK" }
  | { type: "SET_ERROR"; message: string }
  | { type: "ADD_TRANSCRIPT"; entry: TranscriptEntry };

function uiReducer(state: UIState, action: UIAction): UIState {
  // ── Reducer logging ────────────────────────────────────────────
  switch (action.type) {
    case "SET_STATUS":
      console.log(`[GAME] Reducer: SET_STATUS → ${action.status} (current: ${state.status})`);
      break;
    case "SET_CONVERSATION_ID":
      console.log(`[GAME] Reducer: SET_CONVERSATION_ID → ${action.id ?? "null"}`);
      break;
    case "AI_TEXT":
      console.log(`[GAME] Reducer: AI_TEXT → "${action.text.slice(0, 80)}${action.text.length > 80 ? "…" : ""}"`);
      break;
    case "GAME_OVER":
      console.log("[GAME] Reducer: GAME_OVER");
      break;
    case "TOGGLE_PAUSE":
      console.log(`[GAME] Reducer: TOGGLE_PAUSE → ${!state.isPaused}`);
      break;
    case "TICK":
      // Logged only occasionally to avoid noise
      break;
    case "SET_ERROR":
      console.log(`[GAME] Reducer: SET_ERROR → "${action.message}"`);
      break;
    case "ADD_TRANSCRIPT":
      // Intentionally silent — high frequency
      break;
    default:
      break;
  }

  switch (action.type) {
    case "SET_STATUS":
      // Don't overwrite "ended" with "idle" (ElevenLabs fires onDisconnect after game over)
      if (state.status === "ended" && action.status === "idle") {
        console.log("[GAME] Reducer: SET_STATUS ignored — already ended");
        return state;
      }
      return { ...state, status: action.status };
    case "SET_CONVERSATION_ID":
      return { ...state, conversationId: action.id };
    case "AI_TEXT":
      return { ...state, lastAiText: action.text, hasAiSpoken: true };
    case "GAME_OVER":
      return { ...state, status: "ended" };
    case "TOGGLE_PAUSE":
      return { ...state, isPaused: !state.isPaused };
    case "TICK":
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    case "SET_ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    case "ADD_TRANSCRIPT":
      return { ...state, transcript: [...state.transcript, action.entry] };
    default:
      return state;
  }
}

const initialUIState: UIState = {
  phase: 0,
  elapsedSeconds: 0,
  status: "idle",
  lastAiText: "",
  hasAiSpoken: false,
  isPaused: false,
  errorMessage: null,
  conversationId: null,
  transcript: [],
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // How long to wait (ms) before auto-nudging the AI to continue narrating
  const SILENCE_TIMEOUT_MS = 12000; // 12 seconds — give players time to think

  // ── Clear silence timer helper ──────────────────────────────
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // ── Stop elapsed seconds timer ───────────────────────────────
  const stopTickTimer = useCallback(() => {
    if (tickIntervalRef.current !== null) {
      console.log("[GAME] Stopping tick interval");
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  // ── Stable callback refs — prevents useConversation from recreating ──
  // ElevenLabs useConversation returns a new object when callback identities
  // change. We use refs so the identity is always stable.
  const clearSilenceTimerRef = useRef(clearSilenceTimer);
  clearSilenceTimerRef.current = clearSilenceTimer;
  const stopTickTimerRef = useRef(stopTickTimer);
  stopTickTimerRef.current = stopTickTimer;

  // ── isPaused ref — lets stable callbacks read the current pause state ──
  // Cannot read state directly inside useCallback([]) closures — they're stale.
  const isPausedRef = useRef(false);
  isPausedRef.current = state.isPaused;

  const stableOnConnect = useCallback(() => {
    console.log("[GAME] Connected to ElevenLabs");
    dispatch({ type: "SET_STATUS", status: "playing" });
    if (tickIntervalRef.current === null) {
      tickIntervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    }
  }, []);

  const stableOnDisconnect = useCallback((details?: { reason: string; message?: string; closeCode?: number; closeReason?: string }) => {
    console.log("[GAME] Disconnected from ElevenLabs:", JSON.stringify(details ?? {}));
    stopTickTimerRef.current();
    clearSilenceTimerRef.current();
    if (details?.reason === "error") {
      const msg = details.message ?? details.closeReason ?? "Connection error";
      console.error(`[GAME] Disconnect reason: error — ${msg}`);
      dispatch({ type: "SET_ERROR", message: msg });
    } else {
      dispatch({ type: "SET_STATUS", status: "idle" });
    }
  }, []);

  const stableOnMessage = useCallback(({ message, source }: { message: string; source: string }) => {
    console.log(`[GAME] Message from ${source}: "${message.slice(0, 100)}${message.length > 100 ? "…" : ""}"`);
    if (source === "ai" && message) {
      dispatch({ type: "AI_TEXT", text: message });
      dispatch({ type: "ADD_TRANSCRIPT", entry: { source: "ai", text: message } });
    }
    if (source === "user" && message) {
      clearSilenceTimerRef.current();
      dispatch({ type: "ADD_TRANSCRIPT", entry: { source: "user", text: message } });
    }
  }, []);

  const stableOnError = useCallback((message: string) => {
    console.error("[GAME] ERROR:", message);
    dispatch({ type: "SET_ERROR", message });
    stopTickTimerRef.current();
  }, []);

  // ── onModeChange needs conversationRef, but conversationRef is defined after
  // useConversation. We use a forward-declared ref that gets assigned below. ──
  const conversationRef = useRef<ReturnType<typeof useConversation> | null>(null);

  const stableOnModeChange = useCallback(({ mode }: { mode: string }) => {
    console.log(`[GAME] Mode changed to: ${mode}`);
    clearSilenceTimerRef.current();
    if (mode === "listening") {
      // Do NOT start the silence timer while paused — the session is muted and
      // the mic is hardware-muted, so there is nothing to nudge and any
      // [silence] message would still consume ElevenLabs quota for an AI
      // response that the player will never hear.
      if (isPausedRef.current) {
        console.log("[GAME] Skipping silence timer — game is paused");
        return;
      }
      silenceTimerRef.current = setTimeout(() => {
        // Double-check pause state at fire time — player may have paused after
        // the timer was set (12 s window).
        if (isPausedRef.current) {
          console.log("[GAME] Silence timer fired but game is paused — skipping");
          return;
        }
        console.log("[GAME] Silence timeout — auto-advancing narration");
        conversationRef.current?.sendUserMessage("[silence]");
      }, SILENCE_TIMEOUT_MS);
    }
  }, []);

  // ── ElevenLabs ConvAI hook — stable callbacks prevent identity churn ──
  // micMuted + volume are controlled props per ElevenLabs docs:
  //   https://elevenlabs.io/docs/eleven-agents/libraries/react
  // When isPaused: mic muted + volume 0 → full silence.
  // When playing: mic open + volume 1 → normal audio.
  // IMPORTANT: Use props (not setVolume method) — the method called before
  // session start can corrupt the SDK's internal audio state.
  const conversation = useConversation({
    onConnect: stableOnConnect,
    onDisconnect: stableOnDisconnect,
    onMessage: stableOnMessage,
    onModeChange: stableOnModeChange,
    onError: stableOnError,
    micMuted: state.isPaused,
    volume: state.isPaused ? 0 : 1,
  });

  // Keep ref fresh so startSession/endSession/togglePause always use current object
  conversationRef.current = conversation;

  // ── Start session ─────────────────────────────────────────────
  const startSession = useCallback(async (storyId?: string) => {
    dispatch({ type: "SET_STATUS", status: "connecting" });
    const resolvedStoryId = storyId ?? DEFAULT_STORY_ID;

    try {
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        console.error("[GAME] NEXT_PUBLIC_ELEVENLABS_AGENT_ID not set");
        dispatch({ type: "SET_ERROR", message: "Missing ElevenLabs Agent ID. Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in your environment." });
        return;
      }

      console.log(`[GAME] Starting session: agentId=${agentId}, storyId=${resolvedStoryId}`);

      // Check mic permission state WITHOUT acquiring a stream.
      // LiveKit (ElevenLabs WebRTC) handles mic acquisition internally via
      // room.localParticipant.setMicrophoneEnabled(true).
      // Pre-acquiring with getUserMedia() then .stop() causes a race condition
      // on Windows Chrome — LiveKit can get a dead/silent audio track.
      try {
        const permResult = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (permResult.state === "denied") {
          console.error("[GAME] Microphone permission denied (checked via Permissions API)");
          dispatch({ type: "SET_ERROR", message: "Microphone access denied. Please allow microphone permission in your browser settings." });
          return;
        }
        console.log(`[GAME] Mic permission state: ${permResult.state} — LiveKit will prompt if needed`);
      } catch {
        // permissions.query may not be supported — proceed anyway, LiveKit will prompt
        console.warn("[GAME] Could not query mic permission state, proceeding");
      }

      // Fetch a signed URL from our server (uses ELEVENLABS_API_KEY server-side).
      // The browser SDK can't call ElevenLabs directly without an API key.
      console.log("[GAME] Fetching signed URL from /api/signed-url");
      const tokenRes = await fetch("/api/signed-url");
      if (!tokenRes.ok) {
        const errBody = await tokenRes.json().catch(() => ({ error: "Failed to get conversation token" }));
        throw new Error(errBody.error ?? `Signed URL request failed (${tokenRes.status})`);
      }
      const { signedUrl } = await tokenRes.json();
      if (!signedUrl) {
        throw new Error("Server returned empty signed URL");
      }
      console.log("[GAME] Got signed URL, starting ElevenLabs session");

      // Overrides enabled on dashboard Security tab.
      // Leading "... " gives WebRTC audio time to initialize before first real word.
      // ElevenLabs calls Mistral directly — system prompt sent via client-side override.
      const elevenLabsCid = await conversationRef.current!.startSession({
        signedUrl,
        overrides: {
          agent: {
            prompt: { prompt: getStoryPrompt(resolvedStoryId) },
            firstMessage: `... ${getFirstMessage(resolvedStoryId)}`,
          },
        },
      });

      console.log(`[GAME] ElevenLabs session started, elevenLabsCid=${elevenLabsCid}`);
      dispatch({ type: "SET_CONVERSATION_ID", id: elevenLabsCid });
    } catch (err) {
      console.error("[GAME] Failed to start session:", err);
      const msg = err instanceof Error ? err.message : String(err);
      dispatch({ type: "SET_ERROR", message: msg });
    }
  }, []);

  // ── End session ───────────────────────────────────────────────
  const endSession = useCallback(async () => {
    console.log("[GAME] Ending session");
    stopTickTimerRef.current();
    clearSilenceTimerRef.current();
    await conversationRef.current?.endSession();
    dispatch({ type: "SET_CONVERSATION_ID", id: null });
    dispatch({ type: "SET_STATUS", status: "idle" });
  }, []);

  // ── Toggle pause ─────────────────────────────────────────────────────────
  // On pause:
  //   1. Dispatch state change (triggers micMuted prop update → SDK mutes mic)
  //   2. Kill the silence timer immediately — no quota should be spent while paused
  //   3. Mute TTS output volume
  // On resume:
  //   1. Dispatch state change (triggers micMuted prop update → SDK unmutes mic)
  //   2. Restore TTS output volume
  //   (Silence timer restarts naturally on next onModeChange → "listening")
  const togglePause = useCallback(() => {
    const pausingNow = !isPausedRef.current; // what the new state will be
    if (pausingNow) {
      // Kill any pending silence nudge immediately — don't wait for onModeChange
      clearSilenceTimerRef.current();
      console.log("[GAME] Paused — silence timer cleared, mic will be muted by SDK");
    } else {
      console.log("[GAME] Resumed — mic will be unmuted by SDK");
    }
    dispatch({ type: "TOGGLE_PAUSE" });
  }, []);

  // Volume is now controlled via the `volume` prop on useConversation above.
  // The old setVolume() method call was removed because calling it before
  // session start could corrupt the SDK's audio initialization.

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopTickTimer();
      clearSilenceTimer();
    };
  }, [stopTickTimer, clearSilenceTimer]);

  const value: GameContextValue = {
    phase: state.phase,
    elapsedSeconds: state.elapsedSeconds,
    status: state.status,
    lastAiText: state.lastAiText,
    hasAiSpoken: state.hasAiSpoken,
    isSpeaking: conversation.isSpeaking,
    isPaused: state.isPaused,
    errorMessage: state.errorMessage,
    transcript: state.transcript,
    startSession,
    endSession,
    togglePause,
    conversationId: state.conversationId,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
