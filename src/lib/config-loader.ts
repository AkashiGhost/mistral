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

  const result = loadStory(storyDir, schemasDir);
  if ("errors" in result) {
    throw new Error(
      `[config-loader] Failed to load story: ${(result as { errors: string[] }).errors.join(", ")}`,
    );
  }
  return (result as { config: GameConfig; warnings: string[] }).config;
}
