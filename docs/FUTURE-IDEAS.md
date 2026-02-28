# Future Ideas

## Episodic Chapters with Context Compaction
Long-form games (5-10 hours) split into chapters. Between chapters, the engine compacts conversation history into a dense summary — preserving key decisions, emotional state, and relationship dynamics while shedding verbatim dialogue. Player plays Chapter 1, understands the world, then returns for Chapter 2 with full continuity but fresh context window.

**Key design questions:**
- What gets preserved vs. discarded between chapters?
- How to handle save/resume across sessions?
- Chapter-to-chapter state: player style scores, flags, trust levels carry forward
- Could use a dedicated "compaction prompt" that summarizes the session for the next chapter's context

## Story Upload Pipeline with Automated Sound Design
User-generated content pipeline where anyone can upload a story and the system handles the rest:

**Pipeline layers:**
1. **Story ingestion** — upload raw story YAML/text
2. **Enhancement layer** — AI improves pacing, dialogue, descriptions
3. **Sound design layer** — analyze story beats, auto-generate sound cues via ElevenLabs SFX API
4. **Timeline generation** — auto-create timed ambient events from story structure
5. **Voice casting** — suggest/assign voices per character
6. **QA layer** — validate all references, test playthrough paths

**Sound types to auto-generate:**
- Ambient backgrounds per scene
- Transition sounds between phases
- Character-specific audio motifs
- Dialogue sound effects (background voices, whispers)

## ElevenLabs Sound Effects API Integration
Script exists at `scripts/generate-sounds.ts` — reads cue-map.yaml, calls API, saves .mp3.
Sound prompts documented in `public/sounds/SOUND-GENERATION-PROMPTS.md` (50 sounds across 3 stories).
Currently manual — run script or generate individually. Future: integrate into pipeline above.

## Scene Imagery During Gameplay
Show visual representations of the current location/scene to the user during gameplay. Each story has card images already (`public/images/stories/{id}/card.webp`) — extend this with scene-specific images that change as the story progresses.

**Approach:**
- Pre-generated scene images per phase/beat (stored in `public/images/stories/{id}/scene-{n}.webp`)
- Subtle fade transitions between scenes, don't break immersion
- Images should be atmospheric/abstract (not literal) — eyes-closed game, images are for before/after
- Future: auto-generate scene images from story description using image generation API

## Auto-Generated Imagery in Story Pipeline
When a user uploads a story, automatically determine what images are needed:
- Analyze story beats, locations, mood progression
- Generate appropriate scene/card images via image generation API
- Match art style to story genre (horror = dark/muted, fantasy = vivid, etc.)
- User can choose art style or let the system pick based on story vibe

## Story Creation Modes
Two modes for story creators:
1. **Full Control** — "I want to write every single dialogue" — user writes all beats, choices, dialogue options
2. **Creative Mode** — "Let it surprise you" — user provides premise, characters, genre, and the system generates the full story structure with beats, choices, and dialogue
- Hybrid mode: user writes key moments, AI fills in transitions and ambient beats

## Fun Story Creation Process
Make the story upload/creation process itself feel like a game:
- Interactive wizard that asks questions about the world, characters, tone
- Preview snippets as you build (hear a sample narration of your opening)
- Collaborative — AI suggests improvements, user accepts/rejects
- Templates for common genres (horror therapy session, mystery lighthouse, etc.)
