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

## Scene-Setting Images (Onboarding)
Show 2-3 images during onboarding to ground the user's imagination BEFORE they close their eyes. "This is where you are. This is what it looks like." Then voice takes over and they walk in their imagination.

**Already working:** OnboardingFlow shows scene images → text overlay → "continue" → headphones → countdown → game starts. Lighthouse and Room 4B have 2 scenes each.

**Needed now:**
- `public/images/stories/the-last-session/scene-1.webp` — the therapy office (warm lamp, leather chair, dim room)
- `public/images/stories/the-last-session/scene-2.webp` — Elara's perspective (the door, the waiting area, arriving)
- Once images exist, add entries to `STORY_ONBOARDING` in `OnboardingFlow.tsx`

**Image style:** Atmospheric, slightly abstract, dark/moody. NOT photorealistic — painterly or cinematic. Help imagination, don't constrain it.

**Future:** Auto-generate scene images per story via image generation API (see pipeline below)

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

## Personalized Scene Images (Face Integration)
Two-level personalization:
1. **Profile photo** — user uploads their photo during account setup
2. **Face-in-scene generation** — onboarding images are generated with the user's face composited into the scene
   - "You're sitting in Elara's therapy office" — but the image actually shows THEM sitting there
   - Uses face-swap or image-generation with face reference (e.g., InstantID, IP-Adapter)
   - Much more immersive — user sees themselves in the story world before closing their eyes
   - Could generate 2-3 personalized scene images per story on first play
   - Cache generated images for replay
   - Privacy: face data stays local or is processed ephemerally, never stored on server

## Research: Health & Wellness Benefits of Immersive Voice Games
Research and compile evidence that playing immersive voice-based games like InnerPlay has indirect health/wellness benefits:
- **Therapeutic parallels** — guided imagery, narrative therapy, bibliotherapy are established techniques. Voice games use similar mechanisms (imagination, emotional engagement, safe space for expression)
- **Stress reduction** — studies on immersive audio experiences, ASMR, guided meditation reducing cortisol
- **Emotional processing** — role-playing and narrative engagement as tools for emotional regulation (similar to drama therapy)
- **Mindfulness through flow state** — eyes-closed, voice-only interaction may induce flow states similar to meditation
- **Cognitive benefits** — imagination exercises, active listening, decision-making under emotional pressure
- **Loneliness / social connection** — parasocial interaction with AI characters as a bridge (not replacement) for people who struggle with human connection
- Goal: build a "Science Behind InnerPlay" page or section that cites real research, not just marketing claims
- Look for: peer-reviewed studies, meta-analyses, established therapeutic frameworks that validate what we're doing indirectly

## Pre-Recorded Gameplay Videos for Marketing
Record actual gameplay sessions and publish as short-form content:
- Instagram Reels / TikTok / YouTube Shorts — 30-60 second highlights
- Show the experience: dark screen, ambient sounds, voice interaction, plot twist moment
- "Watch someone discover the truth about Elara" — curiosity hook
- Viewers think "I want to try this" — drives organic downloads/visits
- Could also do reaction-style videos: film someone's face as they play for the first time
- Key: capture the "wow moment" (revelation scene, unexpected AI response, genuine emotional reaction)
