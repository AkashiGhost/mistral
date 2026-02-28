"use client";

import { useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { useSoundEngine } from "@/hooks/useSoundEngine";

// ─────────────────────────────────────────────
// Game Session — Mistral / ElevenLabs version
// ElevenLabs handles mic + TTS entirely.
// We show: Elara's text, speaking/listening state, choice overlay.
// ─────────────────────────────────────────────

export function GameSession() {
  const {
    status,
    lastElaraText,
    isSpeaking,
    isPaused,
    hasElaraSpoken,
    activeChoice,
    endSession,
    togglePause,
    pendingSoundCues,
    clearSoundCues,
  } = useGame();

  // ── Sound Engine — ambient sounds, timeline, TTS ducking ──
  useSoundEngine({
    status,
    isSpeaking,
    isPaused,
    pendingSoundCues,
    clearSoundCues,
  });

  // ── Mount / unmount logging ──────────────────────────────────
  useEffect(() => {
    console.log("[SESSION] GameSession mounted");
    return () => {
      console.log("[SESSION] GameSession unmounted");
    };
  }, []);

  // ── Status change logging ────────────────────────────────────
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      console.log(`[SESSION] Status changed: ${prevStatusRef.current} → ${status}`);
      prevStatusRef.current = status;
    }
  }, [status]);

  // ── isSpeaking change logging ────────────────────────────────
  const prevIsSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    if (prevIsSpeakingRef.current !== isSpeaking) {
      console.log(`[SESSION] isSpeaking changed: ${prevIsSpeakingRef.current} → ${isSpeaking}`);
      prevIsSpeakingRef.current = isSpeaking;
    }
  }, [isSpeaking]);

  // ── activeChoice appear / disappear logging ──────────────────
  const prevActiveChoiceRef = useRef(activeChoice);
  useEffect(() => {
    const prev = prevActiveChoiceRef.current;
    prevActiveChoiceRef.current = activeChoice;
    if (!prev && activeChoice) {
      console.log(`[SESSION] activeChoice appeared — beatId=${activeChoice.beatId}, options=[${activeChoice.options.map((o) => o.id).join(", ")}]`);
    } else if (prev && !activeChoice) {
      console.log(`[SESSION] activeChoice cleared (beatId=${prev.beatId})`);
    }
  }, [activeChoice]);

  // ── hasElaraSpoken change logging ────────────────────────────
  const prevHasElaraSpokenRef = useRef(hasElaraSpoken);
  useEffect(() => {
    if (prevHasElaraSpokenRef.current !== hasElaraSpoken) {
      console.log(`[SESSION] hasElaraSpoken changed: ${prevHasElaraSpokenRef.current} → ${hasElaraSpoken}`);
      prevHasElaraSpokenRef.current = hasElaraSpoken;
    }
  }, [hasElaraSpoken]);

  // TTS fallback: browser speaks Elara's text if ElevenLabs audio not yet received
  useEffect(() => {
    if (!lastElaraText || typeof window === "undefined" || !window.speechSynthesis) return;
    if (hasElaraSpoken) return;

    const timer = setTimeout(() => {
      if (hasElaraSpoken) return;
      console.log("[SESSION] TTS fallback triggered — ElevenLabs audio not received, using browser speechSynthesis");
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(lastElaraText);
      utt.rate = 0.85;
      utt.pitch = 0.9;
      utt.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) => v.lang.startsWith("en") && /female|woman|girl|zira|hazel|samantha/i.test(v.name)
      );
      if (femaleVoice) {
        console.log(`[SESSION] TTS fallback voice selected: ${femaleVoice.name}`);
        utt.voice = femaleVoice;
      } else {
        console.log("[SESSION] TTS fallback: no matching female voice found, using browser default");
      }
      window.speechSynthesis.speak(utt);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastElaraText]);

  if (status === "ended") {
    return (
      <div
        className="fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          padding: "var(--space-8)",
          textAlign: "center",
          gap: "var(--space-6)",
        }}
      >
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-lg)",
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            maxWidth: "32ch",
          }}
        >
          {lastElaraText || "The session has ended."}
        </p>
        <a
          href="/"
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-ui)",
            opacity: 0.6,
          }}
        >
          Return home
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Main area — nearly blank during gameplay */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-8)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          {/* Breathing / speaking indicator */}
          <div
            className={isSpeaking ? "pulse" : "breathe"}
            style={{
              width: 12,
              height: 12,
              borderRadius: "var(--radius-full)",
              backgroundColor: isSpeaking
                ? "var(--color-accent)"
                : "var(--color-accent-dim)",
            }}
          />
          {status === "playing" && !hasElaraSpoken && (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "var(--font-size-sm)",
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                margin: 0,
                opacity: 0.6,
              }}
            >
              preparing the session...
            </p>
          )}
          {status === "playing" && hasElaraSpoken && (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "var(--font-size-xs)",
                fontFamily: "var(--font-ui)",
                margin: 0,
                opacity: 0.4,
                letterSpacing: "0.06em",
              }}
            >
              {isSpeaking ? "elara is speaking" : "listening..."}
            </p>
          )}
        </div>
      </div>

      {/* Elara's last text — subtle, for accessibility */}
      {lastElaraText && (
        <div
          style={{
            padding: "var(--space-4) var(--space-6)",
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            textAlign: "center",
            maxHeight: "20vh",
            overflow: "hidden",
          }}
        >
          {lastElaraText}
        </div>
      )}

      {/* Pause overlay */}
      {isPaused && (
        <div
          className="fade-in"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-6)",
            zIndex: 50,
          }}
        >
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-lg)",
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            session paused
          </p>
          <button
            type="button"
            onClick={togglePause}
            style={{
              background: "none",
              border: "1px solid var(--color-text-muted)",
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-base)",
              fontFamily: "var(--font-ui)",
              cursor: "pointer",
              padding: "var(--space-3) var(--space-6)",
              borderRadius: "var(--radius-md)",
              letterSpacing: "0.04em",
              minHeight: 48,
              minWidth: 120,
            }}
          >
            resume
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div
        style={{
          padding: "var(--space-3)",
          textAlign: "center",
          borderTop: "1px solid var(--color-bg-elevated)",
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-4)",
        }}
      >
        <button
          type="button"
          onClick={togglePause}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "0.65rem",
            fontFamily: "var(--font-ui)",
            cursor: "pointer",
            opacity: 0.35,
            padding: "var(--space-1)",
            letterSpacing: "0.04em",
          }}
        >
          pause
        </button>
        <button
          type="button"
          onClick={() => {
            console.log("[SESSION] User clicked 'end session' button");
            void endSession();
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "0.65rem",
            fontFamily: "var(--font-ui)",
            cursor: "pointer",
            opacity: 0.25,
            padding: "var(--space-1)",
            letterSpacing: "0.04em",
          }}
        >
          end session
        </button>
      </div>
    </div>
  );
}
