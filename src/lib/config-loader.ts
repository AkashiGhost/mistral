// ─────────────────────────────────────────────
// Config loader — wraps loadStory with default paths from env
// Supports multiple stories via storyId parameter
// ─────────────────────────────────────────────

import path from "path";
import { loadStory } from "./story-loader";
import type { GameConfig } from "./types/game-config";
import { DEFAULT_STORY_ID, type StoryId } from "./constants";

// Re-export shared constants so existing imports from config-loader still work
export { STORY_IDS, DEFAULT_STORY_ID, type StoryId } from "./constants";

// Cache configs per story ID to avoid re-parsing YAML on every request
const configCache = new Map<string, GameConfig>();

export function getGameConfig(storyId?: StoryId): GameConfig {
  const id = storyId ?? DEFAULT_STORY_ID;

  // Return cached config if available
  const cached = configCache.get(id);
  if (cached) return cached;

  const storyDir = path.join(process.cwd(), "stories", id);
  const schemasDir = path.join(process.cwd(), "schemas");

  console.log(`[CONFIG] Loading story config from ${storyDir}`);

  const result = loadStory(storyDir, schemasDir);
  if ("errors" in result) {
    const errors = (result as { errors: string[] }).errors;
    console.error(`[CONFIG] Failed to load story from ${storyDir}: ${errors.join(", ")}`);
    throw new Error(
      `[config-loader] Failed to load story: ${errors.join(", ")}`,
    );
  }

  const { config, warnings } = result as { config: GameConfig; warnings: string[] };

  const phases = config.arc.phases.length;
  const beats = config.arc.phases.reduce((sum, p) => sum + (p.beats?.length ?? 0), 0);
  const endings = config.arc.endingConditions?.length ?? 0;
  console.log(`[CONFIG] Loaded "${id}": ${phases} phases, ${beats} beats, ${endings} endings`);

  if (warnings.length > 0) {
    console.warn(`[CONFIG] Warnings: ${warnings.join(", ")}`);
  }

  configCache.set(id, config);
  return config;
}
