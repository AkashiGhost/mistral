/**
 * generate-sounds.ts
 *
 * Pre-generates sound effects for all stories using the ElevenLabs Sound Effects API.
 * Reads each story's sounds/cue-map.yaml, extracts entries with a generation_prompt,
 * calls the API, and saves the resulting MP3 files to public/sounds/stories/{story-id}/.
 *
 * Usage:
 *   npx tsx scripts/generate-sounds.ts
 *   npx tsx scripts/generate-sounds.ts --story the-last-session
 *   npx tsx scripts/generate-sounds.ts --dry-run
 *   npx tsx scripts/generate-sounds.ts --force
 *   npx tsx scripts/generate-sounds.ts --story the-lighthouse --dry-run
 *
 * Env:
 *   ELEVENLABS_API_KEY — required
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SoundEntry {
  name?: string;
  description?: string;
  asset_path?: string | null;
  generation_prompt?: string | null;
  generation_tool?: string;
  volume?: number;
  loop?: boolean;
  trigger_type?: string;
  target_channel?: string;
  target_channels?: string[];
  [key: string]: unknown;
}

interface CueMap {
  ambient?: Record<string, SoundEntry>;
  intermittent?: Record<string, SoundEntry>;
  transitions?: Record<string, SoundEntry>;
  atmospheric?: Record<string, SoundEntry>;
  endings?: Record<string, SoundEntry>;
  mixing?: unknown;
}

interface GenerationTask {
  storyId: string;
  category: string;
  soundId: string;
  prompt: string;
  durationSeconds: number;
  outputPath: string;
  alreadyExists: boolean;
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): {
  storyFilter: string | null;
  dryRun: boolean;
  force: boolean;
} {
  const args = process.argv.slice(2);
  let storyFilter: string | null = null;
  let dryRun = false;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--story":
        storyFilter = args[++i] ?? null;
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--force":
        force = true;
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        process.exit(1);
    }
  }

  return { storyFilter, dryRun, force };
}

// ---------------------------------------------------------------------------
// Duration heuristics
// ---------------------------------------------------------------------------

/**
 * Determine appropriate duration in seconds based on category, loop flag,
 * and the nature of the sound.
 *
 * Guidelines from requirements:
 *   - Ambient/loop sounds: 8-15 seconds
 *   - One-shot sounds (door slam, glass break): 2-4 seconds
 *   - Transition sounds: 3-5 seconds
 */
function estimateDuration(
  category: string,
  soundId: string,
  entry: SoundEntry
): number {
  const isLoop = entry.loop === true;

  // Short one-shots — specific sounds that are naturally brief
  const shortSounds = [
    "door_knock",
    "door_slam",
    "door_creak",
    "door_check",
    "glass_breaking",
    "clipboard_mark",
    "breath_close",
    "pipe_groan",
  ];
  if (shortSounds.includes(soundId)) {
    return 3;
  }

  // Medium one-shots — thunder, elevator arrive, phone, breathing, etc.
  const mediumSounds = [
    "thunder_distant",
    "thunder_close",
    "elevator_arrive",
    "phone_ring",
    "breathing_heavy",
    "radio_voice",
    "foghorn",
    "birdsong",
    "dawn_birds",
  ];
  if (mediumSounds.includes(soundId)) {
    return 5;
  }

  // Category-based defaults
  switch (category) {
    case "ambient":
      return isLoop ? 12 : 5;
    case "intermittent":
      return 4;
    case "atmospheric":
      return isLoop ? 10 : 5;
    case "endings":
      if (isLoop) return 12;
      if (soundId === "piano_motif") return 5;
      return 4;
    case "transitions":
      return 4;
    default:
      return 5;
  }
}

// ---------------------------------------------------------------------------
// Story discovery
// ---------------------------------------------------------------------------

function discoverStories(
  projectRoot: string,
  storyFilter: string | null
): { storyId: string; cueMapPath: string }[] {
  const storiesDir = path.join(projectRoot, "stories");

  if (!fs.existsSync(storiesDir)) {
    console.error(`Stories directory not found: ${storiesDir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(storiesDir, { withFileTypes: true });
  const stories: { storyId: string; cueMapPath: string }[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (storyFilter && entry.name !== storyFilter) continue;

    const cueMapPath = path.join(
      storiesDir,
      entry.name,
      "sounds",
      "cue-map.yaml"
    );
    if (fs.existsSync(cueMapPath)) {
      stories.push({ storyId: entry.name, cueMapPath });
    } else {
      console.warn(
        `  [WARN] No cue-map.yaml found for story "${entry.name}" — skipping`
      );
    }
  }

  if (storyFilter && stories.length === 0) {
    console.error(
      `No cue-map.yaml found for story "${storyFilter}". ` +
        `Expected at: stories/${storyFilter}/sounds/cue-map.yaml`
    );
    process.exit(1);
  }

  return stories;
}

// ---------------------------------------------------------------------------
// Task extraction from cue-map
// ---------------------------------------------------------------------------

const SOUND_CATEGORIES: (keyof CueMap)[] = [
  "ambient",
  "intermittent",
  "transitions",
  "atmospheric",
  "endings",
];

function extractTasks(
  storyId: string,
  cueMapPath: string,
  outputBase: string,
  force: boolean
): GenerationTask[] {
  const raw = fs.readFileSync(cueMapPath, "utf-8");
  const cueMap = yaml.load(raw) as CueMap;
  const tasks: GenerationTask[] = [];

  for (const category of SOUND_CATEGORIES) {
    const section = cueMap[category];
    if (!section || typeof section !== "object") continue;

    for (const [soundId, entry] of Object.entries(
      section as Record<string, SoundEntry>
    )) {
      // Skip entries without a generation prompt
      if (!entry.generation_prompt) continue;

      // Skip gain automation / orchestrated events (no actual audio to generate)
      if (
        entry.trigger_type &&
        [
          "gain_automation",
          "instant_stop",
          "mute_all",
          "restore_all_channels",
          "volume_pattern",
        ].includes(entry.trigger_type)
      ) {
        continue;
      }

      const outputPath = path.join(
        outputBase,
        "public",
        "sounds",
        "stories",
        storyId,
        `${soundId}.mp3`
      );

      const alreadyExists = fs.existsSync(outputPath);

      if (alreadyExists && !force) {
        continue; // skip existing files unless --force
      }

      tasks.push({
        storyId,
        category,
        soundId,
        prompt: entry.generation_prompt,
        durationSeconds: estimateDuration(category, soundId, entry),
        outputPath,
        alreadyExists,
      });
    }
  }

  return tasks;
}

// ---------------------------------------------------------------------------
// ElevenLabs API call
// ---------------------------------------------------------------------------

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/sound-generation";
const RATE_LIMIT_DELAY_MS = 1500; // 1.5s between requests to avoid rate limits

async function generateSound(
  apiKey: string,
  prompt: string,
  durationSeconds: number
): Promise<Buffer> {
  const response = await fetch(ELEVENLABS_API_URL, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: durationSeconds,
      prompt_influence: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "<unreadable>");
    throw new Error(
      `ElevenLabs API error ${response.status} ${response.statusText}: ${errorBody}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { storyFilter, dryRun, force } = parseArgs();
  // Resolve project root from this script's location (scripts/ -> project root)
  let scriptDir = import.meta.dirname;
  if (!scriptDir) {
    // Fallback for older Node versions
    scriptDir = path.dirname(new URL(import.meta.url).pathname);
    // On Windows, URL pathname may start with /C:/ — strip the leading slash
    if (/^\/[A-Za-z]:/.test(scriptDir)) {
      scriptDir = scriptDir.slice(1);
    }
  }
  const projectRoot = path.resolve(scriptDir, "..");

  console.log("=".repeat(70));
  console.log("  InnerPlay Sound Generator — ElevenLabs SFX API");
  console.log("=".repeat(70));
  console.log(`  Project root : ${projectRoot}`);
  console.log(`  Story filter : ${storyFilter ?? "(all stories)"}`);
  console.log(`  Dry run      : ${dryRun}`);
  console.log(`  Force regen  : ${force}`);
  console.log("");

  // Validate API key (unless dry run)
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!dryRun && !apiKey) {
    console.error(
      "ERROR: ELEVENLABS_API_KEY environment variable is not set.\n" +
        "Set it before running:\n" +
        "  export ELEVENLABS_API_KEY=your_key_here\n" +
        "Or use --dry-run to preview without making API calls."
    );
    process.exit(1);
  }

  // Discover stories
  const stories = discoverStories(projectRoot, storyFilter);
  console.log(`Found ${stories.length} story/stories with cue-map.yaml:\n`);
  for (const s of stories) {
    console.log(`  - ${s.storyId}`);
  }
  console.log("");

  // Collect all generation tasks
  const allTasks: GenerationTask[] = [];
  for (const { storyId, cueMapPath } of stories) {
    const tasks = extractTasks(storyId, cueMapPath, projectRoot, force);
    allTasks.push(...tasks);
  }

  if (allTasks.length === 0) {
    console.log(
      "No sounds to generate. All files already exist (use --force to regenerate)."
    );
    return;
  }

  // Print task summary
  console.log(`Tasks: ${allTasks.length} sound(s) to generate\n`);
  console.log(
    "  " +
      "Story".padEnd(20) +
      "Category".padEnd(15) +
      "Sound ID".padEnd(28) +
      "Duration".padEnd(10) +
      "Status"
  );
  console.log("  " + "-".repeat(85));

  for (const task of allTasks) {
    const status = task.alreadyExists ? "OVERWRITE" : "NEW";
    console.log(
      "  " +
        task.storyId.padEnd(20) +
        task.category.padEnd(15) +
        task.soundId.padEnd(28) +
        `${task.durationSeconds}s`.padEnd(10) +
        status
    );
  }
  console.log("");

  if (dryRun) {
    console.log(
      "[DRY RUN] No API calls made. Remove --dry-run to generate sounds."
    );
    return;
  }

  // Generate sounds
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allTasks.length; i++) {
    const task = allTasks[i];
    const progress = `[${i + 1}/${allTasks.length}]`;

    process.stdout.write(
      `${progress} Generating ${task.storyId}/${task.soundId} (${task.durationSeconds}s)... `
    );

    try {
      const audioData = await generateSound(
        apiKey!,
        task.prompt,
        task.durationSeconds
      );

      // Ensure output directory exists
      const outputDir = path.dirname(task.outputPath);
      fs.mkdirSync(outputDir, { recursive: true });

      // Write the file
      fs.writeFileSync(task.outputPath, audioData);

      const sizeKB = Math.round(audioData.length / 1024);
      console.log(`OK (${sizeKB} KB)`);
      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`FAILED`);
      console.error(`  -> Error: ${message}`);
      failCount++;
    }

    // Rate limit delay between API calls (skip after the last one)
    if (i < allTasks.length - 1) {
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  // Summary
  console.log("");
  console.log("=".repeat(70));
  console.log(`  Done. ${successCount} generated, ${failCount} failed.`);
  if (failCount > 0) {
    console.log("  Re-run with the same flags to retry failed sounds.");
  }
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
