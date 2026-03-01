"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { GameProvider, useGame } from "@/context/GameContext";
import { DEFAULT_STORY_ID } from "@/lib/constants";
import { OnboardingFlow } from "@/components/game/OnboardingFlow";
import { GameSession } from "@/components/game/GameSession";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BreathingDot } from "@/components/ui/BreathingDot";

function PlayContent() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get("story") ?? DEFAULT_STORY_ID;

  const [onboardingDone, setOnboardingDone] = useState(false);
  const { status, startSession, errorMessage } = useGame();

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

  const handleOnboardingComplete = useCallback((firstMessage: string) => {
    console.log(`[PLAY] Onboarding complete — calling startSession(storyId=${storyId}, firstMessage="${firstMessage.slice(0, 60)}…")`);
    setOnboardingDone(true);
    void startSession(storyId, firstMessage);
  }, [startSession, storyId]);

  if (!onboardingDone) {
    return <OnboardingFlow storyId={storyId} onComplete={handleOnboardingComplete} />;
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
          gap: "var(--space-sm)",
        }}
      >
        <BreathingDot />
        <p
          style={{
            color: "var(--muted)",
            fontSize: "var(--type-ui)",
            fontFamily: "var(--font-literary)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          preparing the session...
        </p>
      </div>
    );
  }

  if (status === "error") {
    console.log("[PLAY] Rendering: error screen");
    const isQuotaError = errorMessage?.toLowerCase().includes("quota");
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          gap: "var(--space-md)",
          padding: "var(--space-lg)",
          textAlign: "center",
        }}
      >
        <p style={{
          color: "var(--error)",
          fontFamily: "var(--font-literary)",
          fontSize: "var(--type-body)",
          fontStyle: "italic",
        }}>
          {isQuotaError
            ? "Voice service quota exceeded. Please upgrade your ElevenLabs plan to continue."
            : "Connection lost. The session cannot continue."}
        </p>
        {errorMessage && (
          <p style={{ color: "var(--muted)", fontSize: "var(--type-caption)" }}>
            {errorMessage}
          </p>
        )}
        <a
          href="/"
          style={{
            color: "var(--muted)",
            fontSize: "var(--type-ui)",
            display: "inline-flex",
            alignItems: "center",
            minHeight: "var(--touch-min)",
            padding: "var(--space-xs) var(--space-sm)",
          }}
        >
          Return home
        </a>
      </div>
    );
  }

  return <GameSession storyId={storyId} />;
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
        <Suspense>
          <PlayContent />
        </Suspense>
      </GameProvider>
    </ErrorBoundary>
  );
}
