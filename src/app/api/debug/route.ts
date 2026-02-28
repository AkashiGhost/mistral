// Temporary diagnostic endpoint — DELETE after debugging
// Shows what files exist on Vercel's serverless function filesystem
// AND tries to load each story to see exact error messages
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { loadStory } from "@/lib/story-loader";

export const runtime = "nodejs";

function listDir(dir: string, depth = 0): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const prefix = "  ".repeat(depth);
      if (entry.isDirectory()) {
        results.push(`${prefix}${entry.name}/`);
        if (depth < 3) results.push(...listDir(fullPath, depth + 1));
      } else {
        const size = fs.statSync(fullPath).size;
        results.push(`${prefix}${entry.name} (${size}b)`);
      }
    }
  } catch (err) {
    results.push(`ERROR reading ${dir}: ${(err as Error).message}`);
  }
  return results;
}

function tryLoadStory(storyId: string, cwd: string): { ok: boolean; detail: string } {
  const storyDir = path.join(cwd, "stories", storyId);
  const schemasDir = path.join(cwd, "schemas");

  try {
    const result = loadStory(storyDir, schemasDir);
    if ("errors" in result) {
      return { ok: false, detail: `loadStory returned errors: ${(result as { errors: string[] }).errors.join("; ")}` };
    }
    const { config, warnings } = result as { config: unknown; warnings: string[] };
    const phases = (config as Record<string, { phases?: unknown[] }>).arc?.phases?.length ?? 0;
    return { ok: true, detail: `Loaded OK — ${phases} phases, warnings: [${warnings.join(", ")}]` };
  } catch (err) {
    return { ok: false, detail: `Exception: ${(err as Error).message}\n${(err as Error).stack?.split("\n").slice(0, 3).join("\n")}` };
  }
}

export async function GET() {
  const cwd = process.cwd();
  const storiesDir = path.join(cwd, "stories");
  const schemasDir = path.join(cwd, "schemas");

  const storyResults: Record<string, { ok: boolean; detail: string }> = {};
  for (const id of ["the-last-session", "the-lighthouse", "room-4b"]) {
    storyResults[id] = tryLoadStory(id, cwd);
  }

  return NextResponse.json({
    cwd,
    storiesExists: fs.existsSync(storiesDir),
    schemasExists: fs.existsSync(schemasDir),
    storyLoadResults: storyResults,
    storiesContents: listDir(storiesDir),
    schemasContents: listDir(schemasDir),
  });
}
