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
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  selectChoice: (beatId: string, optionId: string) => void;
  clearSoundCues: () => void;
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
  | { type: "GAME_OVER" };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_STATUS":
      // Don't overwrite "ended" with "idle" (ElevenLabs fires onDisconnect after game over)
      if (state.status === "ended" && action.status === "idle") return state;
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
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // ── Poll game state ───────────────────────────────────────────
  const pollGameState = useCallback(async () => {
    const cid = conversationIdRef.current;
    if (!cid) return;
    try {
      const res = await fetch(`/api/game-state?cid=${cid}`);
      if (!res.ok) return;
      const data = (await res.json()) as Record<string, unknown>;

      dispatch({ type: "STATE_POLL", payload: data });

      if (Array.isArray(data.soundCues) && data.soundCues.length > 0) {
        dispatch({
          type: "ADD_SOUND_CUES",
          cues: data.soundCues as Array<{ soundId: string; position: number }>,
        });
      }

      if (data.gameOver) {
        dispatch({ type: "GAME_OVER" });
        stopPolling();
      }
    } catch {
      // Non-critical — continue polling
    }
  }, [stopPolling]);

  // ── ElevenLabs ConvAI hook ────────────────────────────────────
  const conversation = useConversation({
    onConnect: () => {
      dispatch({ type: "SET_STATUS", status: "playing" });
      // Poll every 3s for choices / state events
      if (pollIntervalRef.current === null) {
        pollIntervalRef.current = setInterval(pollGameState, 3000);
      }
    },
    onDisconnect: () => {
      stopPolling();
      // SET_STATUS "idle" is ignored by reducer when status is already "ended"
      dispatch({ type: "SET_STATUS", status: "idle" });
    },
    onMessage: ({ message, source }: { message: string; source: string }) => {
      if (source === "ai" && message) {
        dispatch({ type: "ELARA_TEXT", text: message });
        // Immediate poll after each AI turn to pick up choices instantly
        void pollGameState();
      }
    },
    onModeChange: ({ mode }: { mode: string }) => {
      // mode is "speaking" or "listening" — we already track isSpeaking from the hook
    },
    onError: (message: string) => {
      console.error("[ElevenLabs]", message);
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
        console.error("[GameContext] NEXT_PUBLIC_ELEVENLABS_AGENT_ID not set");
        dispatch({ type: "SET_STATUS", status: "error" });
        return;
      }

      // Request mic permission explicitly — ElevenLabs SDK does NOT auto-prompt
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        console.error("[GameContext] Microphone permission denied");
        dispatch({ type: "SET_STATUS", status: "error" });
        return;
      }

      const cid = await conversation.startSession({
        agentId,
        connectionType: "webrtc",
        overrides: {
          agent: {
            prompt: {
              prompt:
                "You are Elara. Your actual personality and story instructions are provided by the custom LLM server. Simply relay the responses from the custom LLM naturally. Do not add your own personality or instructions beyond what the LLM provides.",
            },
            firstMessage:
              "Thank you for seeing me tonight, doctor. The building is strange at this hour — I don't think I've ever heard it this quiet.",
          },
        },
      });
      conversationIdRef.current = cid;
      dispatch({ type: "SET_CONVERSATION_ID", id: cid });

      // Init game state server-side keyed to this conversationId
      await fetch("/api/game-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: cid }),
      });
    } catch (err) {
      console.error("[GameContext] Failed to start session:", err);
      dispatch({ type: "SET_STATUS", status: "error" });
    }
  }, [conversation]);

  // ── End session ───────────────────────────────────────────────
  const endSession = useCallback(async () => {
    stopPolling();
    await conversation.endSession();
    conversationIdRef.current = null;
    dispatch({ type: "SET_CONVERSATION_ID", id: null });
    dispatch({ type: "SET_STATUS", status: "idle" });
  }, [conversation, stopPolling]);

  // ── Select narrative choice ───────────────────────────────────
  const selectChoice = useCallback(
    async (beatId: string, optionId: string) => {
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
    conversationId: state.conversationId,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
