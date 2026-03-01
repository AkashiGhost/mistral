/**
 * Keyword-based sound cue detection — matches AI narration text to registered sounds.
 * Each story has its own keyword map since sounds are story-specific.
 */

interface SoundCue {
  soundId: string;
  volume: number;
}

interface KeywordRule {
  /** Regex pattern to match against AI text (case-insensitive) */
  pattern: RegExp;
  soundId: string;
  /** Volume for the triggered sound (0-1) */
  volume: number;
}

// Story-specific keyword maps
const KEYWORD_RULES: Record<string, KeywordRule[]> = {
  "the-call": [
    { pattern: /\b(static|crackl|interference)\b/i, soundId: "phone_static", volume: 0.3 },
    { pattern: /\b(hum|buzz|electrical)\b/i, soundId: "electrical_hum", volume: 0.2 },
    { pattern: /\b(rumbl|tremor|vibrat|deep.*sound|ground.*shak)\b/i, soundId: "sub_bass", volume: 0.4 },
    { pattern: /\b(disconnect|dead.*line|line.*dead|hung up|cut off)\b/i, soundId: "disconnect_tone", volume: 0.6 },
    { pattern: /\b(walk|step|going|moving|heading|corridor|hallway|running)\b/i, soundId: "footsteps", volume: 0.35 },
    { pattern: /\b(water|drip|flood|rising|splash|puddle|drain)\b/i, soundId: "water_drip", volume: 0.3 },
    { pattern: /\b(door|open|close|slam|creak|handle|heavy.*door)\b/i, soundId: "door_creak", volume: 0.25 },
    { pattern: /\b(keypad|press|button|code|number|punch|dial)\b/i, soundId: "keypad_beep", volume: 0.3 },
    { pattern: /\b(vent|crawl|squeeze|ceiling|climb|shaft)\b/i, soundId: "metal_scrape", volume: 0.2 },
    { pattern: /\b(pipe|valve|turn|wrench|plumbing)\b/i, soundId: "pipe_clank", volume: 0.3 },
    { pattern: /\b(breath|panting|gasp|hyperventilat|lungs)\b/i, soundId: "heavy_breathing", volume: 0.2 },
  ],
  "the-last-session": [
    { pattern: /\b(rain|storm|pour|thunder|downpour)\b/i, soundId: "rain", volume: 0.3 },
    { pattern: /\b(clock|tick|ticking)\b/i, soundId: "clock", volume: 0.4 },
    { pattern: /\b(drone|humming|low.*sound|resonan)\b/i, soundId: "cello_drone", volume: 0.25 },
    { pattern: /\b(silence|quiet|stopped|nothing)\b/i, soundId: "low_tone", volume: 0.15 },
  ],
  "the-lighthouse": [
    { pattern: /\b(wave|ocean|sea|water.*crash|surf)\b/i, soundId: "ocean", volume: 0.3 },
    { pattern: /\b(wind|gale|howl|gust)\b/i, soundId: "wind", volume: 0.35 },
    { pattern: /\b(creak|groan|wood|timber)\b/i, soundId: "creak", volume: 0.2 },
    { pattern: /\b(foghorn|horn|signal|beacon)\b/i, soundId: "foghorn_drone", volume: 0.3 },
  ],
  "room-4b": [
    { pattern: /\b(fluorescent|flicker|light.*buzz|tube)\b/i, soundId: "fluorescent_hum", volume: 0.2 },
    { pattern: /\b(machin|motor|generator|engine)\b/i, soundId: "machinery", volume: 0.25 },
    { pattern: /\b(metal|clang|echo|ring.*out)\b/i, soundId: "metal_echo", volume: 0.3 },
    { pattern: /\b(heartbeat|pulse|thump|beat)\b/i, soundId: "heartbeat_drone", volume: 0.25 },
  ],
};

/**
 * Parse AI narration text for keyword-based sound cues.
 * Returns unique sound IDs matched (no duplicates within one message).
 */
export function parseSoundCues(text: string, storyId: string): SoundCue[] {
  const rules = KEYWORD_RULES[storyId];
  if (!rules) return [];

  const matched = new Set<string>();
  const cues: SoundCue[] = [];

  for (const rule of rules) {
    if (rule.pattern.test(text) && !matched.has(rule.soundId)) {
      matched.add(rule.soundId);
      cues.push({ soundId: rule.soundId, volume: rule.volume });
    }
  }

  return cues;
}

/**
 * Strip any [SOUND:xxx] markers from text (in case LLM emits them despite instructions).
 * Returns clean text for display.
 */
export function stripSoundMarkers(text: string): string {
  return text.replace(/\[SOUND:[^\]]*\]/g, "").replace(/\s{2,}/g, " ").trim();
}
