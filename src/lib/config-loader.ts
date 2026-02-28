// ─────────────────────────────────────────────
// Config loader — wraps loadStory with default paths from env
// ─────────────────────────────────────────────

import path from "path";
import { loadStory } from "./story-loader";
import type { GameConfig } from "./types/game-config";

export function getGameConfig(): GameConfig {
  const storyDir =
    process.env.STORIES_BASE_PATH ??
    path.join(process.cwd(), "stories", "the-last-session");
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
  console.log(`[CONFIG] Loaded: ${phases} phases, ${beats} beats, ${endings} endings`);

  if (warnings.length > 0) {
    console.warn(`[CONFIG] Warnings: ${warnings.join(", ")}`);
  }

  return config;
}
