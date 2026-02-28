# InnerPlay — Product Requirements Document (v2)

**ID**: PRD-001
**Status**: Draft — Iterating (v2: architecture + interruption + sound pipeline resolved)
**Owner**: Akash Manmohan
**Created**: 2026-02-26
**Hackathon**: Mistral AI Worldwide Hackathon | Feb 28 – Mar 1, 2026 | Online

---

## Summary

InnerPlay is a voice-based immersive game platform where users close their eyes, enter a story world narrated by AI, and interact using natural speech. The AI narrates, NPCs respond with distinct voices, and the story adapts to the player's choices. Built on Mistral Large 3 (story engine), Mistral Small 3.2 (fast NPC dialogue), Voxtral Realtime (STT), and ElevenLabs (TTS + character voices).

---

## Problem Statement

- **User need**: 8 billion people have the most powerful imagination engine ever created, and use it to scroll TikTok. Audiobooks are passive. Games need screens. There is no product that combines AI narration + voice interaction + cinematic sound design + imagination-based gameplay.
- **Business goal**: Win Mistral Worldwide Hackathon (Best Video Game + Best ElevenLabs prizes). Validate product-market fit.
- **Success metric**: Judges say "I want this to exist" and "I've never seen this before."

---

## Target Users

- **Primary**: People who enjoy imagination, daydreaming, and audio content. High-absorption personalities (~50-60% of population).
- **Context**: Bedtime, relaxation, commute (eyes closed, headphones on)
- **Power users**: ~6% hyperphantasics + ~10% hypnotic virtuosos — these will be evangelists
- **Note**: ~4% with aphantasia will need a "sensory emphasis" mode (future)

---

## Hackathon Demo: "The Last Session"

### Concept: Psychological Horror-Mystery

You are a therapist. Your last patient, Elara, arrives for an emergency session. She's calm — too calm. As the session progresses:
1. She knows things no patient should know
2. The building goes silent — elevator, footsteps, HVAC disappear one by one
3. She starts asking YOU questions — the power dynamic inverts
4. The revelation at minute 8: what she IS depends on what you said

### Why This Game

- Therapy IS conversation — no tutorial needed, voice interaction is the core mechanic
- Shows Mistral's ability to maintain context, understand nuance, adapt tone
- Unique concept — nobody at a hackathon is building this
- Horror = strongest genre for audio-only (backed by podcast data, neuroscience)
- Targets "Best Video Game Project" and "Best Use of ElevenLabs" prizes

### Story Structure (10-12 minutes)

Based on neuroscience research: alpha power peaks at minute 14, no benefit beyond 20 min.

| Phase | Time | What Happens | Sound Design |
|---|---|---|---|
| Ritual Entry (Masked Intro) | 0:00-0:30 | Eyes close. Breathing. "You're in your office. It's 8:47 PM." | Rain fades in. Room tone loads. Clock starts. |
| Ordinary World | 0:30-3:00 | Normal therapy. Establish rapport. First interaction. | Full ambient (elevator, footsteps above, HVAC) |
| Escalating Wrongness | 3:00-6:00 | She references your coffee order. Quotes unspoken thoughts. | Sounds BEGIN DISAPPEARING one by one |
| Power Inversion | 6:00-8:00 | She asks YOU questions. You realize you should leave. | Only rain remains. Low cello drone enters. |
| The Revelation (PEAK) | 8:00-10:00 | What Elara is — changes based on player's responses | 2 seconds ABSOLUTE SILENCE. Then single low tone. |
| Resolution | 10:00-12:00 | Final choice. Ending shaped by all conversation choices. | Rain returns. Warmth or cold depending on ending. |

### Choice Architecture

- 3 choice points (branch and bottleneck — paths diverge but reconverge at key beats)
- 8-12 possible paths, 3-4 meaningfully different endings
- Natural language input — NOT "option A or B"
- When user tries impossible things: intent parser + rules engine + graceful narration
- One moment where agency is REVOKED (horror mechanic): "You said stay silent. But your voice came out anyway."

### Character: Elara

- Voice: ElevenLabs custom voice — calm, slightly amused, precise diction
- Personality: Intelligent, observant, mirrors the player's energy
- Knowledge: Knows things she shouldn't. Player discovers this gradually.
- Boundaries: Stays in-universe. Will not discuss real-world topics.
- In this story, Elara IS the narrator — no separate narrator needed. She speaks directly to you.

---

## Technical Architecture

### Hybrid Story Model

**Story structure = pre-written. Narration = live-generated.**

| Layer | Pre-Written (YAML/JSON config) | Live-Generated (Mistral Large) |
|---|---|---|
| Story arc (scenes, beats, timing) | ✅ | |
| Choice points & branch logic | ✅ | |
| World rules & constraints | ✅ | |
| Elara's personality & secrets | ✅ | |
| Actual narration text | | ✅ |
| Response to user speech | | ✅ |
| Emotional tone adaptation | | ✅ |

Like jazz: chord changes (story beats) fixed, melody (narration) improvised live.

### Pipeline (v2 — Hackathon)

**This is a PIPELINE, not an agentic system.** No autonomous agents, no multi-step tool orchestration, no agent-to-agent communication. Each step feeds the next sequentially.

```
[Visual Onboarding]  → Next.js UI: character sketch + world image (5-10 sec)
         ↓
[Ritual Entry]        → Eyes close. Breathing instruction. Audio layers load.
         ↓              (Ritual IS the game — masked introduction, not loading)
[Ambient Audio]       → Pre-loaded loops: rain, room tone, clock (Web Audio API)
         ↓
[Story Begins]        → ElevenLabs ConvAI WebSocket (manages full voice loop)
         ↓                    ↓
[User Speaks]         → ElevenLabs VAD detects speech → Scribe v2 STT (~150ms)
         ↓
[Intent Parse]        → Mistral Small 3.2 — lightweight router, 4 intents:
         ↓              DIALOGUE | ACTION | QUESTION | META (~50ms)
[Rules Check]         → CODE (not LLM): check world rules, return valid/invalid
         ↓
[Story Generation]    → Mistral Large 3 (Conversations API, streaming)
         ↓              Receives: system prompt + scene definition + state + history
[Response Parse]      → CODE: parse [SOUND_CUE] markers from FULL generated text
         ↓              (parsed immediately, not just from spoken portion)
[State Update]        → CODE: update StoryState, trigger sound changes
         ↓
[Voice Output]        → ElevenLabs TTS (Elara's voice, streaming)
         ↓
[Audio Mixing]        → Web Audio API: TTS + ambient layers + crossfades
         ↓
[User Hears]          → Mixed output through headphones
```

### Interruption Handling

ElevenLabs ConvAI handles interruption natively via WebSocket:

1. Client sends `user_audio_chunk` continuously (even during agent speech)
2. Server VAD detects user speaking → fires `interruption` event
3. Server fires `agent_response_correction` with:
   - `original_agent_response` = full LLM generation
   - `corrected_agent_response` = what was actually spoken/delivered
4. Server transcribes user speech → fires `user_transcript`
5. Next LLM call: conversation history contains corrected text (what was spoken)

**Key design decisions:**
- Sound cues parsed from FULL generated response (not spoken portion) → prevents desync
- Story state advances based on what was GENERATED, not what was HEARD
- Mistral Conversations API stores full history → LLM always knows context regardless of interruption point
- Use `contextual_update` WebSocket message to inject story state after interruption
- React SDK: `useConversation({ onInterruption, onMessage, onVadScore })` — must enable client events in Agent > Advanced settings

**Interruption is NOT a bug — it's a feature.** User interrupting Elara mid-sentence is natural conversation behavior. The system handles it gracefully.

### Option A: ElevenLabs ConvAI as Voice Shell (RECOMMENDED for hackathon)

- ElevenLabs handles STT + VAD + TTS + turn-taking as one managed WebSocket
- Mistral plugged in as Custom LLM via OpenAI-compatible proxy route
- Build time: ~4-6 hours to working demo
- Latency: ~600-900ms end-to-end

### Option B: Custom Pipeline (more control, more work)

- Browser SpeechRecognition or Voxtral Realtime → Mistral Large → ElevenLabs TTS streaming
- Build time: ~10-16 hours
- Latency: ~1.2-2.0s
- Advantage: Can use Voxtral (Mistral's own STT) which looks better to judges

### RECOMMENDED: Start with Option A, upgrade to Option B if time allows

This gives a working demo by hour 6, then the remaining hours polish and add features.

### Two-Model Strategy

| Model | Role | Why |
|---|---|---|
| Mistral Large 3 | Story narration, Elara's dialogue | Frontier quality, creative |
| Mistral Small 3.2 | Intent parsing, validation, summarization | Fast, cheap, low latency |
| Voxtral Realtime | Speech-to-text (if using Option B) | Mistral's own — impresses judges |

### NPC Persona Management

**Single model + character cards. Not multi-agent.**

- One Mistral Large agent with all characters defined in system prompt
- Character cards: personality, voice style, knowledge, secrets, limits
- State tracks `active_character` — LLM responds in-character
- Knowledge filtering: system prompt tells LLM what each character knows/doesn't know
- "The Last Session" has ONE NPC (Elara = character + narrator) — multi-NPC is future

**Why not multi-agent:** Context budget math — 10-12 min session uses ~8,000 tokens total (6K history + 2K system prompt). That's 6% of Mistral Large's 128K context. No constraint. Single model sees FULL conversation → perfect consistency.

### State Management

```
StoryState {
  session_id: string
  conversation_id: string          // Mistral Conversations API
  current_scene: "setup" | "unease" | "inversion" | "revelation" | "resolution"
  current_beat: string             // Granular beat within scene
  active_character: string         // Who is speaking (default: "elara")
  choices_made: string[]           // Natural language summary of each choice
  elara_knowledge: string[]        // What Elara has revealed she knows
  sounds_removed: string[]         // Which ambient sounds have disappeared
  sounds_active: string[]          // Currently playing ambient layers
  tension_level: 1-10
  player_trust_level: 1-10         // Does the player trust Elara?
  ending_path: "A" | "B" | "C" | "D"
  last_interruption_beat: string   // Beat where user last interrupted
}
```

Code manages state. LLM receives state as context. LLM never decides physics — code does.

### Sound Design Strategy

**Pre-designed components (prepare before hackathon — content, not code):**
- Rain loop (spatial, left-heavy for "window is to the left")
- Room tone (HVAC hum)
- Clock tick (metronome, stops at peak)
- Low cello drone (enters during escalation)
- Sub-bass rumble (20-30 Hz, for dread)
- Absolute silence file (2 seconds)
- Elara's theme: 3-note piano motif

**Sound Generation Pipeline:**

| Asset Type | Tool | Why |
|---|---|---|
| Ambient SFX loops (rain, room tone, clock) | ElevenLabs Sound Effects API | Native loop toggle, WAV 48kHz, 4 variations per request |
| Musical drones (cello, sub-bass) | Stable Audio 2.5 (via fal.ai) | Up to 3 min, <2s generation, instrument quality |
| Full horror score (if needed) | Stable Audio 2.5 or Suno V5 | Longer atmospheric tracks |
| Quick SFX prototyping | CassetteAI (fal.ai) | 1-second generation |
| Free/local fallback | Meta AudioGen/MusicGen | RTX 3060 runs small/medium |

**ElevenLabs SFX API details:** 30s max, 40 credits/sec, Creator plan ($11/mo) = ~83 clips. Prompt influence adjustable.

**Cost estimate:** ~$12 total for complete sound palette (~15 assets).

**Web Audio API Mixing Architecture:**
```
                    AudioContext
                         |
          +--------------+--------------+
          |              |              |
    [Rain Loop]   [Room Tone]    [ElevenLabs TTS]
    BufferSource  BufferSource   MediaElementSource
     (loop=true)  (loop=true)    (via MediaSource API)
          |              |              |
      GainNode       GainNode       GainNode
          |              |              |
          +--------------+--------------+
                         |
                    GainNode (master)
                         |
                  AudioContext.destination
```

- Pre-load all WAV files during visual onboarding
- `linearRampToValueAtTime` for smooth crossfades (no clicks)
- Duck ambient layers when TTS speaks, bring back after
- `audioCtx.resume()` after user gesture (browser requirement)
- ElevenLabs TTS stream → MediaSource API → `<audio>` element → `MediaElementAudioSourceNode`

**Live components:**
- ElevenLabs TTS: Elara's voice (live, streaming)
- Ambient mixing: Web Audio API crossfades sounds out as story progresses
- Sound cue parsing: code reads `[SOUND_CUE: remove_hvac]` from LLM response

**What CANNOT be live for hackathon:**
- Music generation (too slow, too unpredictable)
- Sound effect generation (pre-generate all effects)

### Memory Architecture

**For 10-12 minute sessions: NO RAG needed.**
- Mistral Conversations API stores full history server-side
- Each turn sends conversation_id, API injects full prior context automatically
- World rules + character cards go in system prompt (immutable)
- State object in code tracks everything else
- For future (multi-session campaigns): add Supabase for persistent saves

---

## Website / UI Design (Hackathon MVP)

### Pages

1. **Landing page**: Hero with tagline, "Close your eyes. Open your mind." One CTA: "Play Now"
2. **Game page**: Visual onboarding (sketches, 5-10 sec) → audio-only mode → game plays
3. **Future**: Marketplace with game cards, user-created games, popular/trending

### No login required for hackathon. Direct to game.

### Mobile-first responsive. Optimized for phone (user lies down with headphones).

### Visual Onboarding

- Show loose sketches/concept art of Elara, the office, the rain
- NOT photorealistic — imprecise visuals force top-down cortical engagement (neuroscience)
- 5-10 second display, then fade to dark screen with audio controls
- Could use Pixtral (Mistral's vision model) to generate sketches, or pre-make them

---

## Neuroscience-Backed Design Decisions

| Decision | Research Basis |
|---|---|
| Loose sketches for onboarding | Top-down imagery activation; schema loading without constraining imagination (Kosslyn 2003, Dijkstra 2018) |
| 10-12 min session | Alpha peaks at min 14; no benefit beyond 20 min (Zemla 2023) |
| Spatial audio (binaural) | Primary driver of "presence" in audio experiences |
| Somatic suggestion | Works without hypnosis in eyes-closed states (Markmann 2023). Start ambient, then specific. |
| Silence before scare | Brain fills silence with imagination. 2s silence > any loud sound. |
| Dread 80%, Terror 15%, Horror 5% | Orson Scott Card's hierarchy. Alien = 4 min of monster in 117 min film. |
| Sub-bass (20-30 Hz) | Triggers unease without conscious awareness (Tandy 1998) |
| ASMR elements (whispered narration) | Measurable HR reduction in 5 min (Engelbregt 2022) |
| Heartbeat pacing | 60-80 BPM calm, 100-120 BPM tension (Fagioli 2024) |
| "You feel cold on your neck" | Interoception-imagination loop deepens with each suggestion (Parra & Rey 2021) |
| Rain as emotional anchor | Constant throughout; other sounds disappear around it |
| Sounds disappearing = dread | Subtractive sound design (removing) more effective than additive for horror |
| One moment of silence before the reveal | Psychoacoustically powerful — sudden silence creates stronger startle than loud sounds |

---

## Demo Strategy (3 minutes)

```
0:00-0:30  HOOK
  Play 15 seconds of actual game audio (rain, Elara's voice, tension)
  "That's InnerPlay. You close your eyes, and AI takes you somewhere else."

0:30-1:00  PROBLEM
  "8 billion people have the most powerful imagination engine ever created,
   and we use it to scroll TikTok. What if you could play a game with just
   your voice and your imagination?"

1:00-2:30  LIVE DEMO
  Show the app. Press play. Let judges hear 30s of soundscape.
  Show voice interaction: user speaks, Elara responds.
  Show a choice point. Narrate the tech briefly.

2:30-3:00  CLOSE
  "Mistral Large generates the story. Mistral Small handles NPC intent.
   ElevenLabs voices each character. The pipeline is genre-agnostic."
  [Flash: genre cards — Horror, Fantasy, Mystery, Mythology]
  "Close your eyes. Open your mind. InnerPlay."
```

### 20% Rule: Spend ~10 hours on presentation prep

- Pre-write the "golden path" demo script
- Pre-load all data, no loading screens
- Rehearse 5+ times
- Have backup video recording
- Stop coding by 12pm March 1 (presentations at 3pm)

---

## Prize Targets

| Prize | Fit | Strategy |
|---|---|---|
| Best Video Game Project | DIRECT HIT | InnerPlay IS a game. Custom Game Boy prize. |
| Best Use of ElevenLabs | DIRECT HIT | Elara's voice, sound effects, real-time TTS |
| 1st Place Online | Strong | Innovation + Technical + Creativity + Pitch |
| Global Winner | Our aim | Requires unforgettable demo |
| Best Vibe Usage | Secondary | Immersive aesthetic fits |

---

## Hackathon Rules (Confirmed)

- ✅ Allowed before Feb 28: planning, API accounts, story writing, architecture sketching, sound assets
- ❌ NOT allowed before Feb 28: writing actual code
- ✅ Allowed tools: anything — Mistral, ElevenLabs, any library/framework
- "Projects must be original and developed during the hackathon."

---

## Tech Stack

| Component | Tool | Version |
|---|---|---|
| Frontend | Next.js (App Router) | 16.1.6 |
| AI Story Engine | Mistral Large 3 (Agents API + Conversations) | mistral-large-latest |
| Fast NPC/Intent | Mistral Small 3.2 | mistral-small-latest |
| Speech Input | Voxtral Realtime / Browser SpeechRecognition | voxtral-mini-transcribe-realtime-2602 |
| Voice Output | ElevenLabs (TTS streaming) | @elevenlabs/elevenlabs-js 2.36.0 |
| Voice Loop | ElevenLabs ConvAI (WebSocket) | @elevenlabs/react 0.14.1 |
| Audio Mixing | Web Audio API | Browser native |
| Deploy | Vercel | Latest |
| SDK | @mistralai/mistralai | 1.14.1 |

---

## NotebookLM Knowledge Bases

| Notebook | ID | Purpose |
|---|---|---|
| Voice Game Design & Audio UX | cf7db979-3d29-450d-aa2f-429b2caabd3c | BBC R&D, Alexa games, ElevenLabs storytelling, Earplay |
| Horror Story Architecture | e4ac72d0-04b9-4397-b9a4-849032f95b81 | Choice of Games, Emily Short, Magnus Archives, Darkfield |
| Mistral + ElevenLabs Technical | 32b09954-f5b8-44ea-9540-2eb0218098d0 | API docs, latency optimization, pipeline patterns |
| Product Brain (PRD + Decisions) | 0c707a76-98d0-4c43-a87a-94f815814406 | Game concepts, hackathon strategy, architecture |

---

## Story Pipeline Architecture (for future games)

Each story = a config folder:
```
stories/the-last-session/
  world-rules.yaml    → physics, constraints
  characters.yaml     → Elara card (voice, personality, secrets, limits)
  arc.yaml            → 5-8 scenes, choice points, bottlenecks
  prompts.yaml        → system prompt for Mistral Large
  sounds/             → ambient loops, effects, music
  visuals/            → onboarding sketches
```

Engine is generic, content is pluggable. Same pipeline produces horror, fantasy, mystery.

---

## Future Enhancements (NOT for hackathon)

- User-created games (pipeline + guardrails + quality check)
- Login / accounts / save progress
- Multiplayer (shared story, choices affect each other)
- Heart rate monitoring (smartwatch integration)
- Brainwave reading (far future)
- Marketplace with trending/popular games
- Multiple genres: mystery, sci-fi, mythology, romance
- "The Cartographer's Garden" (fantasy/wonder second game)
- Familiar story adaptations (public domain mythology, fairy tales)
- Session save/restore across multiple sessions

---

### Ritual Entry = Masked Introduction (Design Detail)

The ritual (0:00-0:30) is NOT loading time — it IS the game beginning.

```
[User presses "Play"]
Screen dims to black over 3 seconds

Elara (calm, warm, slightly clinical):
  "Close your eyes."                    → ensures audio-only mode
  [2 second pause]
  "Take a breath in..."                → activates parasympathetic nervous system
  [Rain sound fades in gently]
  "...and let it out slowly."
  [Room tone: HVAC hum, clock tick]     → loads ambient, confirms mixing works
  "Good. You're in your office now.
   It's 8:47 PM. Your last appointment."
  [Clock tick prominent]                → temporal anchor (heartbeat pacing)
  "The rain hasn't stopped since morning."
  "There's a knock at your door."       → first interaction prompt, game started
```

Every element serves a technical AND psychological function. User never experiences a "tutorial."

---

## Research Documents

| Document | Path |
|---|---|
| Story Pipeline Architecture | `docs/research/story-generation-pipeline-research.md` |
| ElevenLabs Interruption Architecture | `docs/research/elevenlabs-interruption-architecture.md` |
| Sound Design Pipeline | `docs/research/sound-design-pipeline-research.md` |
| NotebookLM Resources (curated) | `docs/research/notebooklm-resources.md` |

---

## Resolved Questions (from v1)

| Question | Resolution |
|---|---|
| NPC-as-narrator vs separate narrator? | Elara IS the narrator for "The Last Session." Per-story config for future. |
| How to mix ambient + TTS in real-time? | Web Audio API: BufferSource (loops) + MediaElementSource (TTS) → GainNodes → master. See sound design research. |
| Sound assets: which tools? | ElevenLabs SFX (ambient loops) + Stable Audio 2.5 (drones/music). ~$12 total. |
| Pre-written vs live generation? | Hybrid: structure pre-written (YAML), narration live-generated (Mistral Large). |
| How does interruption work? | ElevenLabs ConvAI native: VAD → interruption event → agent_response_correction. See interruption research. |
| Agentic architecture needed? | NO. Pipeline, not agents. Sequential processing, no autonomy. |
| Intent parser scope? | Right-sized: 4 intents (DIALOGUE/ACTION/QUESTION/META), ~50ms on Small 3.2. Not full NLU. |
| Single vs multi-model for NPCs? | Single Mistral Large + character cards. 6% of 128K context used. |
| Which game wins? | "The Last Session" (horror). Data-driven: horror dominates audio, therapy = natural voice interaction, unique concept. |

## Open Questions for Next Iteration

1. ElevenLabs ConvAI Custom LLM proxy — does streaming conversation_id state work with Mistral Conversations API?
2. Visual onboarding: use Pixtral to generate sketches or pre-make them?
3. Elara's ElevenLabs voice: which pre-made voice, or clone a custom one?
4. Demo golden path: exact script for the 90-second live demo portion?
5. What does the "revelation" about Elara actually look like? (needs story writing)
6. How to handle Custom LLM not receiving abort signal on interruption? (keep responses short, detect HTTP disconnect)
7. ConvAI `contextual_update` — how to inject story state mid-conversation without it appearing as dialogue?
