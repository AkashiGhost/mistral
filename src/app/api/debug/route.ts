// Temporary diagnostic endpoint — DELETE after debugging
// Shows what files exist on Vercel's serverless function filesystem
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function GET() {
  const cwd = process.cwd();
  const storiesDir = path.join(cwd, "stories");
  const schemasDir = path.join(cwd, "schemas");

  return NextResponse.json({
    cwd,
    __dirname: __dirname,
    storiesExists: fs.existsSync(storiesDir),
    schemasExists: fs.existsSync(schemasDir),
    storiesContents: listDir(storiesDir),
    schemasContents: listDir(schemasDir),
    cwdContents: listDir(cwd, 0).slice(0, 30),
  });
}
