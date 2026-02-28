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
  lastElaraText: string;
  pendingSoundCues: Array<{ soundId: string; position: number }>;
  hasElaraSpoken: boolean;
  /** Whether Elara is currently speaking (ElevenLabs TTS) */
  isSpeaking: boolean;
  /** Whether the game is paused */
  isPaused: boolean;
  startSession: () => Promise<void>;
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
  lastElaraText: string;
  pendingSoundCues: Array<{ soundId: string; position: number }>;
  hasElaraSpoken: boolean;
  isPaused: boolean;
  conversationId: string | null;
};

type UIAction =
  | { type: "SET_STATUS"; status: UIState["status"] }
  | { type: "SET_CONVERSATION_ID"; id: string | null }
  | { type: "STATE_POLL"; payload: Record<string, unknown> }
  | { type: "CLEAR_CHOICE" }
  | { type: "ELARA_TEXT"; text: string }
  | { type: "ADD_SOUND_CUES"; cues: Array<{ soundId: string; position: number }> }
  | { type: "CLEAR_SOUND_CUES" }
  | { type: "GAME_OVER" }
  | { type: "TOGGLE_PAUSE" };

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
    case "ELARA_TEXT":
      console.log(`[GAME] Reducer: ELARA_TEXT → "${action.text.slice(0, 80)}${action.text.length > 80 ? "…" : ""}"`);
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
    case "ELARA_TEXT":
      return { ...state, lastElaraText: action.text, hasElaraSpoken: true };
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
  lastElaraText: "",
  pendingSoundCues: [],
  hasElaraSpoken: false,
  isPaused: false,
  conversationId: null,
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);
  const conversationIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Stop polling helper ───────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      console.log("[GAME] Stopping poll interval");
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
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

  // ── ElevenLabs ConvAI hook ────────────────────────────────────
  const conversation = useConversation({
    onConnect: () => {
      console.log("[GAME] Connected to ElevenLabs, starting poll");
      dispatch({ type: "SET_STATUS", status: "playing" });
      // Poll every 3s for choices / state events
      if (pollIntervalRef.current === null) {
        pollIntervalRef.current = setInterval(pollGameState, 3000);
      }
    },
    onDisconnect: () => {
      console.log("[GAME] Disconnected from ElevenLabs");
      stopPolling();
      // SET_STATUS "idle" is ignored by reducer when status is already "ended"
      dispatch({ type: "SET_STATUS", status: "idle" });
    },
    onMessage: ({ message, source }: { message: string; source: string }) => {
      console.log(`[GAME] Message from ${source}: "${message.slice(0, 100)}${message.length > 100 ? "…" : ""}"`);
      if (source === "ai" && message) {
        dispatch({ type: "ELARA_TEXT", text: message });
        // Immediate poll after each AI turn to pick up choices instantly
        void pollGameState();
      }
    },
    onModeChange: ({ mode }: { mode: string }) => {
      console.log(`[GAME] Mode changed to: ${mode}`);
      // mode is "speaking" or "listening" — we already track isSpeaking from the hook
    },
    onError: (message: string) => {
      console.error("[GAME] ERROR:", message);
      dispatch({ type: "SET_STATUS", status: "error" });
      stopPolling();
    },
  });

  // ── Start session ─────────────────────────────────────────────
  const startSession = useCallback(async () => {
    dispatch({ type: "SET_STATUS", status: "connecting" });
    try {
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        console.error("[GAME] NEXT_PUBLIC_ELEVENLABS_AGENT_ID not set");
        dispatch({ type: "SET_STATUS", status: "error" });
        return;
      }
      console.log(`[GAME] Starting session with agentId=${agentId}`);

      // Request mic permission explicitly — ElevenLabs SDK does NOT auto-prompt
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("[GAME] Mic permission granted");
      } catch (err) {
        console.error("[GAME] Microphone permission denied:", err);
        dispatch({ type: "SET_STATUS", status: "error" });
        return;
      }

      // Overrides enabled on dashboard Security tab.
      // firstMessage: leading "..." gives WebRTC audio time to initialize before first real word.
      // System prompt NOT overridden — webhook handles it server-side.
      console.log("[GAME] Starting session with firstMessage override for audio init padding");

      const cid = await conversation.startSession({
        agentId,
        connectionType: "webrtc",
        overrides: {
          agent: {
            firstMessage: "... Hello, Doctor. Thank you for seeing me tonight.",
          },
        },
      });
      console.log(`[GAME] Session started, conversationId=${cid}`);
      conversationIdRef.current = cid;
      dispatch({ type: "SET_CONVERSATION_ID", id: cid });

      // Init game state server-side keyed to this conversationId
      await fetch("/api/game-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: cid }),
      });
      console.log("[GAME] Game state initialized");
    } catch (err) {
      console.error("[GAME] Failed to start session:", err);
      dispatch({ type: "SET_STATUS", status: "error" });
    }
  }, [conversation]);

  // ── End session ───────────────────────────────────────────────
  const endSession = useCallback(async () => {
    console.log("[GAME] Ending session");
    stopPolling();
    await conversation.endSession();
    conversationIdRef.current = null;
    dispatch({ type: "SET_CONVERSATION_ID", id: null });
    dispatch({ type: "SET_STATUS", status: "idle" });
  }, [conversation, stopPolling]);

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
    const willPause = !state.isPaused;
    dispatch({ type: "TOGGLE_PAUSE" });
    // Mute/unmute ElevenLabs TTS output
    if (willPause) {
      conversation.setVolume({ volume: 0 });
    } else {
      conversation.setVolume({ volume: 1 });
    }
  }, [state.isPaused, conversation]);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const value: GameContextValue = {
    ...state,
    isSpeaking: conversation.isSpeaking,
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
