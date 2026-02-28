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
