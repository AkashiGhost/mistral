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
import type { ChoicePromptPayload } from "@/lib/types/llm";
import { DEFAULT_STORY_ID } from "@/lib/constants";

// ─────────────────────────────────────────────
// Game context — ElevenLabs ConvAI + game state polling
// ElevenLabs handles: STT, TTS, WebSocket to their servers
// We handle: game logic via webhook, state polling, choice UI
// ─────────────────────────────────────────────

interface GameContextValue {
  phase: number;
  beatIndex: number;
  elapsedSeconds: number;
  trustLevel: number;
  status: "idle" | "connecting" | "playing" | "ended" | "error";
  activeChoice: ChoicePromptPayload | null;
  lastAiText: string;
  pendingSoundCues: Array<{ soundId: string; position: number }>;
  hasAiSpoken: boolean;
  /** Whether the AI character is currently speaking (ElevenLabs TTS) */
  isSpeaking: boolean;
  /** Whether the game is paused */
  isPaused: boolean;
  /** Human-readable error message when status is "error" */
  errorMessage: string | null;
  startSession: (storyId?: string, firstMessage?: string) => Promise<void>;
  endSession: () => Promise<void>;
  selectChoice: (beatId: string, optionId: string) => void;
  clearSoundCues: () => void;
  togglePause: () => void;
  conversationId: string | null;
}

type UIState = {
  phase: number;
  beatIndex: number;
  elapsedSeconds: number;
  trustLevel: number;
  status: "idle" | "connecting" | "playing" | "ended" | "error";
  activeChoice: ChoicePromptPayload | null;
  lastAiText: string;
  pendingSoundCues: Array<{ soundId: string; position: number }>;
  hasAiSpoken: boolean;
  isPaused: boolean;
  errorMessage: string | null;
  conversationId: string | null;
};

type UIAction =
  | { type: "SET_STATUS"; status: UIState["status"] }
  | { type: "SET_CONVERSATION_ID"; id: string | null }
  | { type: "STATE_POLL"; payload: Record<string, unknown> }
  | { type: "CLEAR_CHOICE" }
  | { type: "AI_TEXT"; text: string }
  | { type: "ADD_SOUND_CUES"; cues: Array<{ soundId: string; position: number }> }
  | { type: "CLEAR_SOUND_CUES" }
  | { type: "GAME_OVER" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "SET_ERROR"; message: string };

function uiReducer(state: UIState, action: UIAction): UIState {
  // ── Reducer logging ────────────────────────────────────────────
  switch (action.type) {
    case "SET_STATUS":
      console.log(`[GAME] Reducer: SET_STATUS → ${action.status} (current: ${state.status})`);
      break;
    case "SET_CONVERSATION_ID":
      console.log(`[GAME] Reducer: SET_CONVERSATION_ID → ${action.id ?? "null"}`);
      break;
    case "STATE_POLL":
      console.log("[GAME] Reducer: STATE_POLL payload:", {
        phase: action.payload.phase,
        beatIndex: action.payload.beatIndex,
        trustLevel: action.payload.trustLevel,
        activeChoice: action.payload.activeChoice ? "(present)" : null,
        soundCues: Array.isArray(action.payload.soundCues)
          ? `${(action.payload.soundCues as unknown[]).length} cue(s)`
          : "none",
        gameOver: action.payload.gameOver,
      });
      break;
    case "CLEAR_CHOICE":
      console.log("[GAME] Reducer: CLEAR_CHOICE");
      break;
    case "AI_TEXT":
      console.log(`[GAME] Reducer: AI_TEXT → "${action.text.slice(0, 80)}${action.text.length > 80 ? "…" : ""}"`);
      break;
    case "ADD_SOUND_CUES":
      console.log(`[GAME] Reducer: ADD_SOUND_CUES → ${action.cues.length} cue(s):`, action.cues);
      break;
    case "CLEAR_SOUND_CUES":
      console.log("[GAME] Reducer: CLEAR_SOUND_CUES");
      break;
    case "GAME_OVER":
      console.log("[GAME] Reducer: GAME_OVER");
      break;
    case "TOGGLE_PAUSE":
      console.log(`[GAME] Reducer: TOGGLE_PAUSE → ${!state.isPaused}`);
      break;
    case "SET_ERROR":
      console.log(`[GAME] Reducer: SET_ERROR → "${action.message}"`);
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
    case "STATE_POLL":
      return {
        ...state,
        phase: (action.payload.phase as number) ?? state.phase,
        beatIndex: (action.payload.beatIndex as number) ?? state.beatIndex,
        elapsedSeconds: (action.payload.elapsedSeconds as number) ?? state.elapsedSeconds,
        trustLevel: (action.payload.trustLevel as number) ?? state.trustLevel,
        activeChoice: (action.payload.activeChoice as ChoicePromptPayload | null) !== undefined
          ? (action.payload.activeChoice as ChoicePromptPayload | null)
          : state.activeChoice,
      };
    case "CLEAR_CHOICE":
      return { ...state, activeChoice: null };
    case "AI_TEXT":
      return { ...state, lastAiText: action.text, hasAiSpoken: true };
    case "ADD_SOUND_CUES":
      return {
        ...state,
        pendingSoundCues: [...state.pendingSoundCues, ...action.cues],
      };
    case "CLEAR_SOUND_CUES":
      return { ...state, pendingSoundCues: [] };
    case "GAME_OVER":
      return { ...state, status: "ended", activeChoice: null };
    case "TOGGLE_PAUSE":
      return { ...state, isPaused: !state.isPaused };
    case "SET_ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    default:
      return state;
  }
}

const initialUIState: UIState = {
  phase: 0,
  beatIndex: 0,
  elapsedSeconds: 0,
  trustLevel: 3,
  status: "idle",
  activeChoice: null,
  lastAiText: "",
  pendingSoundCues: [],
  hasAiSpoken: false,
  isPaused: false,
  errorMessage: null,
  conversationId: null,
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);
  const conversationIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // How long to wait (ms) before auto-nudging the AI to continue narrating
  const SILENCE_TIMEOUT_MS = 12000; // 12 seconds — give players time to think

  // ── Stop polling helper ───────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      console.log("[GAME] Stopping poll interval");
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // ── Clear silence timer helper ──────────────────────────────
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // ── Poll game state ───────────────────────────────────────────
  const pollGameState = useCallback(async () => {
    const cid = conversationIdRef.current;
    if (!cid) return;
    console.log(`[GAME] Polling state for cid=${cid}`);
    try {
      const res = await fetch(`/api/game-state?cid=${cid}`);
      if (!res.ok) {
        console.warn(`[GAME] Poll returned non-OK status: ${res.status}`);
        return;
      }
      const data = (await res.json()) as Record<string, unknown>;
      console.log("[GAME] Poll response data:", data);

      dispatch({ type: "STATE_POLL", payload: data });

      if (Array.isArray(data.soundCues) && data.soundCues.length > 0) {
        dispatch({
          type: "ADD_SOUND_CUES",
          cues: data.soundCues as Array<{ soundId: string; position: number }>,
        });
      }

      if (data.gameOver) {
        console.log("[GAME] Game over detected");
        dispatch({ type: "GAME_OVER" });
        stopPolling();
      }
    } catch (err) {
      // Non-critical — continue polling
      console.warn("[GAME] Poll fetch error (non-critical):", err);
    }
  }, [stopPolling]);

  // ── Stable callback refs — prevents useConversation from recreating ──
  // ElevenLabs useConversation returns a new object when callback identities
  // change. We use refs so the identity is always stable.
  const pollGameStateRef = useRef(pollGameState);
  pollGameStateRef.current = pollGameState;
  const stopPollingRef = useRef(stopPolling);
  stopPollingRef.current = stopPolling;
  const clearSilenceTimerRef = useRef(clearSilenceTimer);
  clearSilenceTimerRef.current = clearSilenceTimer;

  const stableOnConnect = useCallback(() => {
    console.log("[GAME] Connected to ElevenLabs, starting poll");
    dispatch({ type: "SET_STATUS", status: "playing" });
    if (pollIntervalRef.current === null) {
      pollIntervalRef.current = setInterval(() => void pollGameStateRef.current(), 3000);
    }
  }, []);

  const stableOnDisconnect = useCallback((details?: { reason: string; message?: string; closeCode?: number; closeReason?: string }) => {
    console.log("[GAME] Disconnected from ElevenLabs:", JSON.stringify(details ?? {}));
    stopPollingRef.current();
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
      void pollGameStateRef.current();
    }
    if (source === "user") {
      clearSilenceTimerRef.current();
    }
  }, []);

  const stableOnError = useCallback((message: string) => {
    console.error("[GAME] ERROR:", message);
    dispatch({ type: "SET_ERROR", message });
    stopPollingRef.current();
  }, []);

  // ── onModeChange needs conversationRef, but conversationRef is defined after
  // useConversation. We use a forward-declared ref that gets assigned below. ──
  const conversationRef = useRef<ReturnType<typeof useConversation> | null>(null);

  const stableOnModeChange = useCallback(({ mode }: { mode: string }) => {
    console.log(`[GAME] Mode changed to: ${mode}`);
    clearSilenceTimerRef.current();
    if (mode === "listening") {
      silenceTimerRef.current = setTimeout(() => {
        console.log("[GAME] Silence timeout — auto-advancing narration");
        conversationRef.current?.sendUserMessage("[silence]");
      }, SILENCE_TIMEOUT_MS);
    }
  }, []);

  // ── ElevenLabs ConvAI hook — stable callbacks prevent identity churn ──
  const conversation = useConversation({
    onConnect: stableOnConnect,
    onDisconnect: stableOnDisconnect,
    onMessage: stableOnMessage,
    onModeChange: stableOnModeChange,
    onError: stableOnError,
  });

  // Keep ref fresh so startSession/endSession/togglePause always use current object
  conversationRef.current = conversation;

  // ── Start session ─────────────────────────────────────────────
  const startSession = useCallback(async (storyId?: string, firstMessage?: string) => {
    dispatch({ type: "SET_STATUS", status: "connecting" });
    const resolvedStoryId = storyId ?? DEFAULT_STORY_ID;
    const resolvedFirstMessage = firstMessage ?? "...";

    try {
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        console.error("[GAME] NEXT_PUBLIC_ELEVENLABS_AGENT_ID not set");
        dispatch({ type: "SET_STATUS", status: "error" });
        return;
      }

      // Generate our OWN session ID. ElevenLabs does NOT forward its
      // conversation_id in the webhook payload (it only sends OpenAI-compatible
      // fields). Without this, the webhook auto-generates a different ID →
      // "split brain" where webhook saves state under one key and the frontend
      // polls under another, so game state never reaches the UI.
      const sessionId = crypto.randomUUID();
      console.log(`[GAME] Starting session: agentId=${agentId}, storyId=${resolvedStoryId}, sessionId=${sessionId}`);

      // Check mic permission state WITHOUT acquiring a stream.
      // LiveKit (ElevenLabs WebRTC) handles mic acquisition internally via
      // room.localParticipant.setMicrophoneEnabled(true).
      // Pre-acquiring with getUserMedia() then .stop() causes a race condition
      // on Windows Chrome — LiveKit can get a dead/silent audio track.
      try {
        const permResult = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (permResult.state === "denied") {
          console.error("[GAME] Microphone permission denied (checked via Permissions API)");
          dispatch({ type: "SET_STATUS", status: "error" });
          return;
        }
        console.log(`[GAME] Mic permission state: ${permResult.state} — LiveKit will prompt if needed`);
      } catch {
        // permissions.query may not be supported — proceed anyway, LiveKit will prompt
        console.warn("[GAME] Could not query mic permission state, proceeding");
      }

      // Overrides enabled on dashboard Security tab.
      // Leading "... " gives WebRTC audio time to initialize before first real word.
      // System prompt NOT overridden — webhook handles it server-side.
      // story_id + session_id passed via customLlmExtraBody → becomes
      // elevenlabs_extra_body in webhook, ensuring both sides use the same session key.
      console.log(`[GAME] firstMessage: "${resolvedFirstMessage.slice(0, 60)}…"`);

      // Init game state server-side BEFORE starting ElevenLabs session.
      // This ensures the session exists when the webhook receives its first request.
      await fetch("/api/game-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: sessionId, storyId: resolvedStoryId }),
      });
      console.log("[GAME] Game state initialized server-side");

      const elevenLabsCid = await conversationRef.current!.startSession({
        agentId,
        connectionType: "webrtc",
        overrides: {
          agent: {
            firstMessage: `... ${resolvedFirstMessage}`,
          },
        },
        customLlmExtraBody: {
          story_id: resolvedStoryId,
          session_id: sessionId,
        },
      });
      console.log(`[GAME] ElevenLabs session started, elevenLabsCid=${elevenLabsCid}, our sessionId=${sessionId}`);

      // Use OUR session ID for all game state operations (not ElevenLabs' ID)
      conversationIdRef.current = sessionId;
      dispatch({ type: "SET_CONVERSATION_ID", id: sessionId });
    } catch (err) {
      console.error("[GAME] Failed to start session:", err);
      dispatch({ type: "SET_STATUS", status: "error" });
    }
  }, []);

  // ── End session ───────────────────────────────────────────────
  const endSession = useCallback(async () => {
    console.log("[GAME] Ending session");
    stopPollingRef.current();
    clearSilenceTimerRef.current();
    await conversationRef.current?.endSession();
    conversationIdRef.current = null;
    dispatch({ type: "SET_CONVERSATION_ID", id: null });
    dispatch({ type: "SET_STATUS", status: "idle" });
  }, []);

  // ── Select narrative choice ───────────────────────────────────
  const selectChoice = useCallback(
    async (beatId: string, optionId: string) => {
      console.log(`[GAME] Choice selected: beat=${beatId}, option=${optionId}`);
      dispatch({ type: "CLEAR_CHOICE" });
      const cid = conversationIdRef.current;
      if (!cid) return;
      try {
        await fetch("/api/choice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: cid, beatId, optionId }),
        });
      } catch {
        // Non-critical
      }
    },
    [],
  );

  const clearSoundCues = useCallback(() => {
    dispatch({ type: "CLEAR_SOUND_CUES" });
  }, []);

  // ── Toggle pause ────────────────────────────────────────────
  const togglePause = useCallback(() => {
    dispatch({ type: "TOGGLE_PAUSE" });
    // Mute/unmute ElevenLabs TTS output — read current state from reducer
    // (state.isPaused before dispatch is the "old" value, so !old = new)
  }, []);

  // Apply pause volume via effect so it reads the latest state
  useEffect(() => {
    conversationRef.current?.setVolume({ volume: state.isPaused ? 0 : 1 });
  }, [state.isPaused]);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopPolling();
      clearSilenceTimer();
    };
  }, [stopPolling, clearSilenceTimer]);

  const value: GameContextValue = {
    ...state,
    isSpeaking: conversation.isSpeaking,
    errorMessage: state.errorMessage,
    startSession,
    endSession,
    selectChoice,
    clearSoundCues,
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
