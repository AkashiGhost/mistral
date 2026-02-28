"use client";

// ─────────────────────────────────────────────
// useSoundEngine — React hook that manages the SoundEngine lifecycle
// Handles: init, synthetic sound generation, timeline start,
// TTS ducking, sound cue playback, and cleanup.
// ─────────────────────────────────────────────

import { useEffect, useRef, useCallback } from "react";
import { SoundEngine } from "@/lib/sound-engine";
import { generateAllSynthSounds } from "@/lib/synth-sounds";
import type { TimelineEvent as SoundTimelineEvent } from "@/lib/sound-engine";

// Timeline data embedded from timeline.yaml — only the essential events.
// This avoids needing server-side YAML parsing on the client.
const TIMELINE: SoundTimelineEvent[] = [
  // Phase 1: Full ambient
  { time: 0, action: "start_ambient", soundIds: ["rain", "hvac", "clock"] },
  // Phase 2: Subtractive horror
  { time: 210, action: "fade_out", soundId: "hvac", fadeDurationSeconds: 4 },
  { time: 420, action: "hard_stop", soundId: "clock", fadeDurationSeconds: 0 },
  // Phase 3: Atmospheric drones
  { time: 360, action: "fade_in", soundIds: ["cello_drone", "sub_bass"], fadeInSeconds: 8 },
  // Phase 3: Rain volume drop
  { time: 425, action: "volume_adjust", soundId: "rain", targetVolume: 0.4, fadeDurationSeconds: 10 },
  // Phase 4: Mute all for revelation
  { time: 480, action: "mute_all", fadeDurationSeconds: 0.5 },
  // Phase 4: Revelation tone
  { time: 482, action: "fade_in", soundIds: ["low_tone"], fadeInSeconds: 3 },
  // Phase 5: Low tone fades
  { time: 600, action: "fade_out", soundId: "low_tone", fadeDurationSeconds: 4 },
];

interface UseSoundEngineOptions {
  /** Game status — only init when "playing" */
  status: "idle" | "connecting" | "playing" | "ended" | "error";
  /** Whether Elara is currently speaking (for TTS ducking) */
  isSpeaking: boolean;
  /** Whether the game is paused */
  isPaused: boolean;
  /** Sound cues from game state polling */
  pendingSoundCues: Array<{ soundId: string; position: number }>;
  /** Clear processed sound cues */
  clearSoundCues: () => void;
}

export function useSoundEngine({
  status,
  isSpeaking,
  isPaused,
  pendingSoundCues,
  clearSoundCues,
}: UseSoundEngineOptions) {
  const engineRef = useRef<SoundEngine | null>(null);
  const initStartedRef = useRef(false);

  // ── Initialize engine when game starts playing ────────────
  useEffect(() => {
    if (status !== "playing" || initStartedRef.current) return;
    initStartedRef.current = true;

    const setup = async () => {
      try {
        console.log("[USE-SOUND] Initializing SoundEngine...");

        const engine = new SoundEngine({
          ttsDucking: {
            reductionDb: -6,
            fadeInMs: 300,
            fadeOutMs: 600,
          },
          crossfadeDefaultMs: 2000,
          spatialMap: {
            rain: { pan: -0.3 },
            clock: { pan: 0.2 },
            hvac: { pan: 0 },
            cello_drone: { pan: 0 },
            sub_bass: { pan: 0 },
            low_tone: { pan: 0 },
          },
          preloadOrder: [],
        });

        await engine.init();

        // Generate and register synthetic sounds
        const synth = await generateAllSynthSounds();
        engine.registerBuffer("rain", synth.rain);
        engine.registerBuffer("hvac", synth.hvac);
        engine.registerBuffer("clock", synth.clock);
        engine.registerBuffer("cello_drone", synth.cello_drone);
        engine.registerBuffer("sub_bass", synth.sub_bass);
        engine.registerBuffer("low_tone", synth.low_tone);

        engineRef.current = engine;

        // Start the timeline
        engine.startTimeline(TIMELINE);
        console.log("[USE-SOUND] SoundEngine ready, timeline started");
      } catch (err) {
        console.error("[USE-SOUND] Failed to initialize SoundEngine:", err);
      }
    };

    void setup();
  }, [status]);

  // ── TTS Ducking: duck ambient when Elara speaks ───────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (isSpeaking) {
      engine.startDucking();
    } else {
      engine.stopDucking();
    }
  }, [isSpeaking]);

  // ── Pause / Resume ambient audio ─────────────────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (isPaused) {
      engine.pauseAudio();
    } else {
      engine.resumeAudio();
    }
  }, [isPaused]);

  // ── Process pending sound cues from game state ────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || pendingSoundCues.length === 0) return;

    for (const cue of pendingSoundCues) {
      console.log(`[USE-SOUND] Triggering cue: ${cue.soundId}`);
      engine.triggerCue(cue.soundId);
    }
    clearSoundCues();
  }, [pendingSoundCues, clearSoundCues]);

  // ── Cleanup on unmount or game end ────────────────────────
  useEffect(() => {
    if (status === "ended" || status === "error") {
      const engine = engineRef.current;
      if (engine) {
        console.log("[USE-SOUND] Game ended/error — destroying SoundEngine");
        engine.destroy();
        engineRef.current = null;
        initStartedRef.current = false;
      }
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const engine = engineRef.current;
      if (engine) {
        console.log("[USE-SOUND] Component unmounting — destroying SoundEngine");
        engine.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // ── Expose stop method for manual control ─────────────────
  const stopAll = useCallback(() => {
    engineRef.current?.muteAll(0.5);
  }, []);

  return { stopAll };
}
