"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { OnboardingFlow } from "@/components/game/OnboardingFlow";
import { GameSession } from "@/components/game/GameSession";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function PlayContent() {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const { status, startSession } = useGame();

  // ── Mount logging ────────────────────────────────────────────
  useEffect(() => {
    console.log("[PLAY] PlayContent mounted");
    return () => {
      console.log("[PLAY] PlayContent unmounted");
    };
  }, []);

  // ── Status change logging ────────────────────────────────────
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      console.log(`[PLAY] status changed: ${prevStatusRef.current} → ${status}`);
      prevStatusRef.current = status;
    }
  }, [status]);

  // ── onboardingDone change logging ────────────────────────────
  const prevOnboardingRef = useRef(onboardingDone);
  useEffect(() => {
    if (prevOnboardingRef.current !== onboardingDone) {
      console.log(`[PLAY] onboardingDone changed: ${prevOnboardingRef.current} → ${onboardingDone}`);
      prevOnboardingRef.current = onboardingDone;
    }
  }, [onboardingDone]);

  const handleOnboardingComplete = useCallback(() => {
    console.log("[PLAY] Onboarding complete — calling startSession()");
    setOnboardingDone(true);
    void startSession();
  }, [startSession]);

  if (!onboardingDone) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Connecting to ElevenLabs
  if (status === "connecting") {
    console.log("[PLAY] Rendering: connecting screen");
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          gap: "var(--space-3)",
        }}
      >
        <div
          className="breathe"
          style={{
            width: 10,
            height: 10,
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-accent-dim)",
          }}
        />
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Connecting...
        </p>
      </div>
    );
  }

  if (status === "error") {
    console.log("[PLAY] Rendering: error screen");
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          gap: "var(--space-4)",
          padding: "var(--space-8)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--color-danger)" }}>
          Connection lost. The session cannot continue.
        </p>
        <a
          href="/"
          style={{
            color: "var(--color-accent)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          Return home
        </a>
      </div>
    );
  }

  return <GameSession />;
}

export default function PlayPage() {
  // ── Page-level mount logging ─────────────────────────────────
  useEffect(() => {
    console.log("[PLAY] PlayPage mounted");
    return () => {
      console.log("[PLAY] PlayPage unmounted");
    };
  }, []);

  return (
    <ErrorBoundary>
      <GameProvider>
        <PlayContent />
      </GameProvider>
    </ErrorBoundary>
  );
}
