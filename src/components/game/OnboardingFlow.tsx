"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// ─────────────────────────────────────────────
// Story-specific onboarding data
// Scene images + text overlays + first audio line
// The LAST text shown is the FIRST line the AI speaks (image-to-audio bridge)
// ─────────────────────────────────────────────

interface StoryOnboarding {
  scenes: Array<{
    image: string;
    text: string;
  }>;
  firstAudioLine: string;
}

const STORY_ONBOARDING: Record<string, StoryOnboarding> = {
  "the-lighthouse": {
    scenes: [
      {
        image: "/images/stories/the-lighthouse/scene-1.webp",
        text: "A storm is building off the coast. You're alone in the lighthouse. The radio hasn't made a sound in weeks.",
      },
      {
        image: "/images/stories/the-lighthouse/scene-2.webp",
        text: "The radio crackles. A voice: 'Hello? Is someone there?'",
      },
    ],
    firstAudioLine: "Hello? Is someone there? Thank god. We're taking on water.",
  },
  "room-4b": {
    scenes: [
      {
        image: "/images/stories/room-4b/scene-1.webp",
        text: "St. Maren's Hospital. Decommissioned. Your shift starts at midnight.",
      },
      {
        image: "/images/stories/room-4b/scene-2.webp",
        text: "You step into the hallway. The fluorescent light flickers twice, then holds.",
      },
    ],
    firstAudioLine:
      "You step into the hallway. The fluorescent light flickers twice, then holds. Your shift has begun.",
  },
  "the-last-session": {
    scenes: [
      {
        image: "/images/stories/the-last-session/card.webp",
        text: "You are a therapist. It's late. Your last patient has arrived.",
      },
    ],
    firstAudioLine: "... Hello, Doctor. Thank you for seeing me tonight.",
  },
};

type OnboardingStep = "scene" | "headphones" | "countdown";

interface OnboardingFlowProps {
  storyId: string;
  onComplete: (firstMessage: string) => void;
}

export function OnboardingFlow({ storyId, onComplete }: OnboardingFlowProps) {
  const onboarding = STORY_ONBOARDING[storyId] ?? STORY_ONBOARDING["the-last-session"];
  const totalScenes = onboarding.scenes.length;

  const [step, setStep] = useState<OnboardingStep>("scene");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [continueOpacity, setContinueOpacity] = useState(0);
  const [textOpacity, setTextOpacity] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const currentScene = onboarding.scenes[sceneIndex];

  // ── Delayed text fade-in (1s after scene loads) ──────────────
  useEffect(() => {
    if (step !== "scene") return;
    setTextOpacity(0);
    const timer = setTimeout(() => setTextOpacity(1), 800);
    return () => clearTimeout(timer);
  }, [step, sceneIndex]);

  // ── Delayed continue button (invisible 4s, fade in 1s) ──────
  useEffect(() => {
    if (step !== "scene") return;
    setShowContinue(false);
    setContinueOpacity(0);

    const showTimer = setTimeout(() => {
      setShowContinue(true);
      // Start opacity fade after showing
      requestAnimationFrame(() => {
        setContinueOpacity(1);
      });
    }, 4000);

    return () => clearTimeout(showTimer);
  }, [step, sceneIndex]);

  // ── Countdown timer ──────────────────────────────────────────
  useEffect(() => {
    if (step !== "countdown") return;
    if (countdown <= 0) {
      onComplete(onboarding.firstAudioLine);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown, onComplete, onboarding.firstAudioLine]);

  const advance = useCallback(() => {
    if (step === "scene") {
      if (sceneIndex < totalScenes - 1) {
        setSceneIndex(sceneIndex + 1);
      } else {
        setStep("headphones");
      }
    } else if (step === "headphones") {
      setStep("countdown");
    }
  }, [step, sceneIndex, totalScenes]);

  // ── Scene step: image + text + delayed continue ──────────────
  if (step === "scene" && currentScene) {
    return (
      <div
        className="fade-in"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--color-bg)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Scene image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 600,
            aspectRatio: "16 / 9",
            overflow: "hidden",
            borderRadius: "var(--radius-md)",
          }}
        >
          <Image
            src={currentScene.image}
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, 600px"
            style={{ objectFit: "cover" }}
            priority
          />
          {/* Dark overlay for text */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
            }}
          />
        </div>

        {/* Scene text */}
        <p
          style={{
            maxWidth: 480,
            textAlign: "center",
            padding: "var(--space-6) var(--space-4)",
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-lg)",
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            lineHeight: 1.6,
            opacity: textOpacity,
            transition: "opacity 1.5s ease",
          }}
        >
          {currentScene.text}
        </p>

        {/* Continue button — invisible for 4s, fades in over 1s */}
        <div
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showContinue && (
            <button
              type="button"
              onClick={advance}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "var(--font-size-sm)",
                fontFamily: "var(--font-ui)",
                cursor: "pointer",
                letterSpacing: "0.06em",
                opacity: continueOpacity,
                transition: "opacity 1s ease",
                padding: "var(--space-2) var(--space-4)",
              }}
            >
              continue
            </button>
          )}
        </div>

        {/* Scene indicators */}
        {totalScenes > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "var(--space-6)",
              display: "flex",
              gap: "var(--space-2)",
            }}
          >
            {onboarding.scenes.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "var(--radius-full)",
                  backgroundColor:
                    i <= sceneIndex
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                  opacity: i <= sceneIndex ? 1 : 0.3,
                  transition: "var(--transition-normal)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Headphones step ──────────────────────────────────────────
  if (step === "headphones") {
    return (
      <div
        className="fade-in"
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-bg)",
          zIndex: 100,
          padding: "var(--space-8)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: 400,
            fontFamily: "var(--font-body)",
            marginBottom: "var(--space-4)",
            color: "var(--color-text-primary)",
          }}
        >
          Put on headphones
        </h2>
        <p
          style={{
            fontSize: "var(--font-size-lg)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-2)",
            maxWidth: "28ch",
          }}
        >
          Speak naturally. Listen closely.
        </p>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-8)",
            maxWidth: "28ch",
            fontStyle: "italic",
          }}
        >
          Close your eyes when the countdown ends.
        </p>
        <button
          type="button"
          onClick={advance}
          style={{
            minHeight: "var(--touch-min)",
            padding: "var(--space-3) var(--space-8)",
            border: "1px solid var(--color-accent-dim)",
            borderRadius: "var(--radius-full)",
            color: "var(--color-accent)",
            fontSize: "var(--font-size-base)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            transition: "var(--transition-normal)",
            backgroundColor: "transparent",
          }}
        >
          Ready
        </button>
      </div>
    );
  }

  // ── Countdown step ───────────────────────────────────────────
  return (
    <div
      className="fade-in"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
        zIndex: 100,
        padding: "var(--space-8)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "var(--font-size-lg)",
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-6)",
          fontFamily: "var(--font-body)",
        }}
      >
        Close your eyes
      </p>
      <div
        style={{
          fontSize: "var(--font-size-3xl)",
          color: "var(--color-accent)",
          fontFamily: "var(--font-body)",
          fontWeight: 300,
        }}
      >
        {countdown}
      </div>
    </div>
  );
}
