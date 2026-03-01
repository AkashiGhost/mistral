"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { DEFAULT_STORY_ID } from "@/lib/constants";

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
        image: "/images/stories/the-last-session/scene-1.png",
        text: "You are a therapist. It's late. Your last patient has arrived.",
      },
      {
        image: "/images/stories/the-last-session/scene-2.png",
        text: "She sits across from you. Something about her feels... familiar.",
      },
      {
        image: "/images/stories/the-last-session/scene-3.png",
        text: "The door locks behind her. The session has begun.",
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
  const onboarding = STORY_ONBOARDING[storyId] ?? STORY_ONBOARDING[DEFAULT_STORY_ID];
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
          backgroundColor: "var(--black)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Scene image — landscape 16:9 */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "min(90vw, 600px)",
            aspectRatio: "16 / 9",
            maxHeight: "calc(100dvh - 250px)",
            overflow: "hidden",
            borderRadius: 0,
          }}
        >
          <Image
            src={currentScene.image}
            alt=""
            fill
            sizes="(max-width: 600px) 90vw, 600px"
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
            padding: "var(--space-md) var(--space-sm)",
            color: "var(--muted)",
            fontSize: "var(--type-body)",
            fontFamily: "var(--font-literary)",
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
                color: "var(--muted)",
                fontSize: "var(--type-ui)",
                fontFamily: "var(--font-ui)",
                cursor: "pointer",
                letterSpacing: "0.06em",
                opacity: continueOpacity,
                transition: "opacity 1s ease",
                padding: "var(--space-xs) var(--space-sm)",
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
              bottom: "var(--space-md)",
              display: "flex",
              gap: "var(--space-xs)",
            }}
          >
            {onboarding.scenes.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor:
                    i <= sceneIndex
                      ? "var(--accent)"
                      : "var(--muted)",
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
          backgroundColor: "var(--black)",
          zIndex: 100,
          padding: "var(--space-lg)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "var(--type-lead)",
            fontWeight: 400,
            fontFamily: "var(--font-display)",
            marginBottom: "var(--space-sm)",
            color: "var(--white)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          PUT ON HEADPHONES
        </h2>
        <p
          style={{
            fontSize: "var(--type-body)",
            fontFamily: "var(--font-literary)",
            fontStyle: "italic",
            color: "var(--muted)",
            marginBottom: "var(--space-lg)",
            maxWidth: "28ch",
          }}
        >
          speak naturally. listen closely.
        </p>
        <button
          type="button"
          onClick={advance}
          style={{
            minHeight: "var(--touch-min)",
            padding: "var(--space-sm) var(--space-lg)",
            border: "none",
            borderRadius: 0,
            color: "var(--accent)",
            fontSize: "var(--type-body)",
            fontFamily: "var(--font-literary)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            transition: "var(--transition-normal)",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          Begin
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
        backgroundColor: "var(--black)",
        zIndex: 100,
        padding: "var(--space-lg)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "var(--type-body)",
          color: "var(--muted)",
          marginBottom: "var(--space-md)",
          fontFamily: "var(--font-literary)",
          fontStyle: "italic",
        }}
      >
        close your eyes
      </p>
      <div
        style={{
          fontSize: "var(--type-hero)",
          color: "var(--accent)",
          fontFamily: "var(--font-display)",
          fontWeight: 400,
        }}
      >
        {countdown}
      </div>
    </div>
  );
}
