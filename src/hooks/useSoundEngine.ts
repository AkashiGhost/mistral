"use client";

// ─────────────────────────────────────────────
// useSoundEngine — React hook that manages the SoundEngine lifecycle
// Story-aware: loads appropriate sounds and timeline per storyId.
// ─────────────────────────────────────────────

import { useEffect, useRef, useCallback } from "react";
import { SoundEngine } from "@/lib/sound-engine";
import { generateSoundsForStory } from "@/lib/synth-sounds";
import type { TimelineEvent as SoundTimelineEvent } from "@/lib/sound-engine";

// ─────────────────────────────────────────────
// Story-specific timelines
// ─────────────────────────────────────────────

const TIMELINES: Record<string, SoundTimelineEvent[]> = {
  "the-last-session": [
    // Phase 1: Full ambient
    { time: 0, action: "start_ambient", soundIds: ["rain", "hvac", "clock"] },
    // Phase 2: Subtractive horror — HVAC fades
    { time: 210, action: "fade_out", soundId: "hvac", fadeDurationSeconds: 4 },
    // Phase 2: Clock hard stop
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
  ],

  "the-lighthouse": [
    // Phase 1: Storm — ocean, wind, creaking wood
    { time: 0, action: "start_ambient", soundIds: ["ocean", "wind", "creak"] },
    // Phase 2: Radio comes alive
    { time: 180, action: "fade_in", soundIds: ["radio_static"], fadeInSeconds: 3 },
    // Phase 2: Wind intensifies
    { time: 240, action: "volume_adjust", soundId: "wind", targetVolume: 0.8, fadeDurationSeconds: 8 },
    // Phase 3: Creaking stops (structure groans to silence)
    { time: 360, action: "fade_out", soundId: "creak", fadeDurationSeconds: 3 },
    // Phase 3: Foghorn drone emerges
    { time: 380, action: "fade_in", soundIds: ["foghorn_drone", "sub_bass"], fadeInSeconds: 6 },
    // Phase 4: Subtractive — wind dies
    { time: 450, action: "fade_out", soundId: "wind", fadeDurationSeconds: 8 },
    // Phase 4: Radio static fades to nothing
    { time: 470, action: "fade_out", soundId: "radio_static", fadeDurationSeconds: 4 },
    // Phase 5: Just ocean and foghorn, fading
    { time: 540, action: "fade_all_to_nothing", fadeDurationSeconds: 20 },
  ],

  "room-4b": [
    // Phase 1: Hospital ambient — fluorescent hum, distant machinery
    { time: 0, action: "start_ambient", soundIds: ["fluorescent_hum", "machinery"] },
    // Phase 2: Metal echoes begin
    { time: 180, action: "fade_in", soundIds: ["metal_echo"], fadeInSeconds: 4 },
    // Phase 2: Fluorescent flickers (volume oscillation simulated by lowering)
    { time: 240, action: "volume_adjust", soundId: "fluorescent_hum", targetVolume: 0.3, fadeDurationSeconds: 2 },
    // Phase 3: Machinery stops abruptly
    { time: 360, action: "hard_stop", soundId: "machinery", fadeDurationSeconds: 0 },
    // Phase 3: Heartbeat drone emerges
    { time: 365, action: "fade_in", soundIds: ["heartbeat_drone", "sub_bass"], fadeInSeconds: 6 },
    // Phase 4: Fluorescent dies
    { time: 450, action: "hard_stop", soundId: "fluorescent_hum", fadeDurationSeconds: 0 },
    // Phase 4: Low revelation tone
    { time: 455, action: "fade_in", soundIds: ["low_tone"], fadeInSeconds: 4 },
    // Phase 5: Everything fades
    { time: 540, action: "fade_all_to_nothing", fadeDurationSeconds: 15 },
  ],
};

// Story-specific spatial panning
const SPATIAL_MAPS: Record<string, Record<string, { pan: number }>> = {
  "the-last-session": {
    rain: { pan: -0.3 },
    clock: { pan: 0.2 },
    hvac: { pan: 0 },
    cello_drone: { pan: 0 },
    sub_bass: { pan: 0 },
    low_tone: { pan: 0 },
  },
  "the-lighthouse": {
    ocean: { pan: -0.4 },
    wind: { pan: 0.3 },
    creak: { pan: 0.1 },
    foghorn_drone: { pan: -0.2 },
    radio_static: { pan: 0.5 },
    sub_bass: { pan: 0 },
  },
  "room-4b": {
    fluorescent_hum: { pan: 0.1 },
    machinery: { pan: -0.3 },
    metal_echo: { pan: 0.4 },
    heartbeat_drone: { pan: 0 },
    sub_bass: { pan: 0 },
    low_tone: { pan: 0 },
  },
};

interface UseSoundEngineOptions {
  storyId: string;
  status: "idle" | "connecting" | "playing" | "ended" | "error";
  isSpeaking: boolean;
  isPaused: boolean;
  pendingSoundCues: Array<{ soundId: string; position: number }>;
  clearSoundCues: () => void;
}

export function useSoundEngine({
  storyId,
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
        console.log(`[USE-SOUND] Initializing SoundEngine for story: ${storyId}`);

        const spatialMap = SPATIAL_MAPS[storyId] ?? SPATIAL_MAPS["the-last-session"];
        const engine = new SoundEngine({
          ttsDucking: {
            reductionDb: -6,
            fadeInMs: 300,
            fadeOutMs: 600,
          },
          crossfadeDefaultMs: 2000,
          spatialMap,
          preloadOrder: [],
        });

        await engine.init();

        // Generate and register story-specific synthetic sounds
        const sounds = await generateSoundsForStory(storyId);
        for (const [id, buffer] of Object.entries(sounds)) {
          engine.registerBuffer(id, buffer);
        }

        engineRef.current = engine;

        // Start the story-specific timeline
        const timeline = TIMELINES[storyId] ?? TIMELINES["the-last-session"];
        engine.startTimeline(timeline);
        console.log(`[USE-SOUND] SoundEngine ready for "${storyId}", timeline started with ${timeline.length} events`);
      } catch (err) {
        console.error("[USE-SOUND] Failed to initialize SoundEngine:", err);
      }
    };

    void setup();
  }, [status, storyId]);

  // ── TTS Ducking ───────────────────────────────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isSpeaking) {
      engine.startDucking();
    } else {
      engine.stopDucking();
    }
  }, [isSpeaking]);

  // ── Pause / Resume ────────────────────────────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isPaused) {
      engine.pauseAudio();
    } else {
      engine.resumeAudio();
    }
  }, [isPaused]);

  // ── Process pending sound cues ────────────────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || pendingSoundCues.length === 0) return;
    for (const cue of pendingSoundCues) {
      console.log(`[USE-SOUND] Triggering cue: ${cue.soundId}`);
      engine.triggerCue(cue.soundId);
    }
    clearSoundCues();
  }, [pendingSoundCues, clearSoundCues]);

  // ── Cleanup on game end ───────────────────────────────
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

  const stopAll = useCallback(() => {
    engineRef.current?.muteAll(0.5);
  }, []);

  return { stopAll };
}
