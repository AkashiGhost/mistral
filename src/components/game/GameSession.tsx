"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { AtmosphereLayer } from "./AtmosphereLayer";
import { ChoiceDisplay } from "./ChoiceDisplay";
import { BreathingDot } from "@/components/ui/BreathingDot";

// ─────────────────────────────────────────────
// Game Session — Mistral / ElevenLabs version
// ElevenLabs handles mic + TTS entirely.
// We show: Elara's text, speaking/listening state, choice overlay.
// AtmosphereLayer renders for stories with visual atmosphere (Room 4B).
// Breathing dot adapts animation speed to current story phase.
// ─────────────────────────────────────────────

interface GameSessionProps {
  storyId: string;
}

// Stories that show the AtmosphereLayer (fog/vignette)
const ATMOSPHERE_STORIES = new Set(["room-4b"]);

export function GameSession({ storyId }: GameSessionProps) {
  const {
    phase,
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

  const showAtmosphere = ATMOSPHERE_STORIES.has(storyId);

  // ── Sound Engine — story-aware ambient sounds, timeline, TTS ducking ──
  useSoundEngine({
    storyId,
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
          backgroundColor: "var(--black)",
          padding: "var(--space-md)",
          textAlign: "center",
          gap: "var(--space-md)",
        }}
      >
        <p
          style={{
            color: "var(--muted)",
            fontSize: "var(--type-lead)",
            fontFamily: "var(--font-literary)",
            fontStyle: "italic",
            maxWidth: "32ch",
          }}
        >
          {lastElaraText || "The session has ended."}
        </p>
        <a
          href="/"
          style={{
            color: "var(--muted)",
            fontSize: "var(--type-caption)",
            fontFamily: "var(--font-ui)",
            opacity: 0.6,
            display: "inline-flex",
            alignItems: "center",
            minHeight: "var(--touch-min)",
            padding: "var(--space-xs) var(--space-sm)",
          }}
        >
          return home
        </a>
      </div>
    );
  }

  // ── Tap-to-reveal controls ──────────────────────────────────
  const [showControls, setShowControls] = useState(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showControls) return;
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [showControls]);

  const handleMainAreaClick = () => {
    setShowControls(true);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        backgroundColor: "var(--black)",
      }}
    >
      {/* Atmosphere layer — fog/vignette for stories that use it */}
      {showAtmosphere && <AtmosphereLayer phase={phase} />}

      {/* Main area — nearly blank during gameplay */}
      <div
        onClick={handleMainAreaClick}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-lg)",
          position: "relative",
          zIndex: 1,
          cursor: "default",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-sm)",
          }}
        >
          {/* Breathing / speaking indicator — phase-aware animation */}
          <BreathingDot size={12} phase={phase} isSpeaking={isSpeaking} />
          {status === "playing" && !hasElaraSpoken && (
            <p
              style={{
                color: "var(--muted)",
                fontSize: "var(--type-ui)",
                fontFamily: "var(--font-literary)",
                fontStyle: "italic",
                margin: 0,
                opacity: 0.6,
              }}
            >
              preparing the session...
            </p>
          )}
        </div>
      </div>

      {/* Elara's last text — subtle, for accessibility */}
      {lastElaraText && (
        <div
          style={{
            padding: "var(--space-sm) var(--space-md)",
            color: "var(--muted)",
            fontSize: "var(--type-ui)",
            fontFamily: "var(--font-literary)",
            fontStyle: "italic",
            textAlign: "center",
            maxHeight: "20vh",
            overflow: "hidden",
          }}
        >
          {lastElaraText}
        </div>
      )}

      {/* Choice overlay — voice-only choices rendered visually as fallback */}
      {activeChoice && <ChoiceDisplay />}

      {/* Screen reader transcript */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {lastElaraText}
      </div>

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
            gap: "var(--space-md)",
            zIndex: 50,
          }}
        >
          <p
            style={{
              color: "var(--muted)",
              fontSize: "var(--type-body)",
              fontFamily: "var(--font-literary)",
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
              border: "1px solid var(--muted)",
              color: "var(--white)",
              fontSize: "var(--type-body)",
              fontFamily: "var(--font-ui)",
              cursor: "pointer",
              padding: "var(--space-sm) var(--space-md)",
              borderRadius: 0,
              letterSpacing: "0.04em",
              minHeight: 48,
              minWidth: 120,
            }}
          >
            resume
          </button>
        </div>
      )}

      {/* Tap-to-reveal bottom controls */}
      {showControls && (
        <div
          className="fade-in"
          style={{
            padding: "var(--space-sm)",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-md)",
          }}
        >
          <button
            type="button"
            onClick={togglePause}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              fontSize: "var(--type-caption)",
              fontFamily: "var(--font-ui)",
              cursor: "pointer",
              opacity: 0.35,
              padding: "var(--space-sm) var(--space-md)",
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
              color: "var(--muted)",
              fontSize: "var(--type-caption)",
              fontFamily: "var(--font-ui)",
              cursor: "pointer",
              opacity: 0.25,
              padding: "var(--space-sm) var(--space-md)",
              letterSpacing: "0.04em",
            }}
          >
            end session
          </button>
        </div>
      )}
    </div>
  );
}
