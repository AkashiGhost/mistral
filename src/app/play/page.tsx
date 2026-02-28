"use client";

import { useState, useCallback } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { OnboardingFlow } from "@/components/game/OnboardingFlow";
import { GameSession } from "@/components/game/GameSession";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function PlayContent() {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const { status, startSession } = useGame();

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDone(true);
    void startSession();
  }, [startSession]);

  if (!onboardingDone) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Connecting to ElevenLabs
  if (status === "connecting") {
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
  return (
    <ErrorBoundary>
      <GameProvider>
        <PlayContent />
      </GameProvider>
    </ErrorBoundary>
  );
}
