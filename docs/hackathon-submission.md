# InnerPlay -- Close Your Eyes. Speak. Play.

**A voice-only immersive game engine where players close their eyes and interact with AI characters through speech alone, powered by Mistral Large for dynamic narration and ElevenLabs for real-time voice.**

---

## The Problem

8 billion people carry the most powerful imagination engine ever created -- and use it to scroll TikTok.

- **Games are visual-first.** They exclude visually impaired users, demand screens, and create fatigue.
- **Interactive fiction is stuck in text boxes.** It hasn't evolved with AI.
- **Voice AI is used for assistants and customer service** -- never for entertainment, never for immersive storytelling.

There is no product that combines AI narration + voice interaction + cinematic sound design + imagination-based gameplay. **InnerPlay is that product.**

---

## The Solution

InnerPlay **breaks the "text box" paradigm completely**. There is zero visual UI during gameplay.

Players **put on headphones, close their eyes, and speak**. That's the entire interface.

- AI characters respond in real-time with emotional, contextual narration
- A deterministic game engine tracks player behavior, choices, and therapy style to create branching narratives
- Spatial sound design (3D audio, ambient layers, subtractive horror cues) creates a world you *hear* rather than see
- Stories are data files, not code -- the engine is genre-agnostic and extensible

**The ritual entry IS the game.** When Elara says "Close your eyes... take a breath in..." the audio layers load, the ambient soundscape builds, and the player is inside the story before they realize it started.

---

## Featured Story: "The Last Session"

A **10-minute psychological horror experience**.

You are a therapist. Your last patient, Elara, arrives for an emergency session. She's calm -- too calm. As the session progresses:

1. **She knows things no patient should know** -- your coffee order, your unspoken thoughts
2. **The building goes silent** -- elevator hum, footsteps above, HVAC disappear one by one
3. **She starts asking YOU questions** -- the power dynamic inverts
4. **2 seconds of absolute silence. Then a single low tone.** The revelation: what Elara IS depends on how you played.

**The story adapts to you:**
- 5 phases of escalating tension
- 3 choice points with natural language input (not "option A or B")
- **4 revelation variants** based on YOUR therapy style (empathetic, analytical, nurturing, confrontational)
- **17 possible endings** evaluated by a rules engine
- One moment where your agency is **revoked** -- horror mechanic: "You said stay silent. But your voice came out anyway."

Built on 14,000+ lines of hand-written YAML story content across 31 files -- world rules, character cards, phase behaviors, sound timelines, and ending conditions. Plus 2 additional stories (The Lighthouse, Room 4B) demonstrating the engine's versatility.

---

## How It Works

```
Player speaks
    |
    v
ElevenLabs ConvAI (WebRTC) -- captures voice, handles VAD + turn-taking
    |
    v
Custom LLM Webhook (/api/llm/chat/completions)
    |
    v
5-Layer Context Builder:
    1. World rules + character card (~600 tokens)
    2. Phase behavior override (~300 tokens)
    3. Recent exchange summary (~400 tokens)
    4. Compressed conversation history (~200 tokens)
    5. Live game state snapshot (~100 tokens)
    |
    v
Mistral Large -- generates in-character narration with [SOUND:x] markers
    |
    v
SSE stream -- tokens flow to ElevenLabs in real-time (sub-second TTFV)
    |            Sound markers stripped before TTS, parsed for game state
    v
ElevenLabs TTS -- converts to Elara's voice with emotional expression
    |
    v
Web Audio API -- mixes voice + ambient layers + spatial sound + dynamic ducking
    |
    v
Player hears a living world through headphones
```

**Post-stream (fire-and-forget, doesn't block TTS):**
Sound cues fire. Beat advances. Phase transitions evaluate. Player style scores accumulate. Ending conditions check. The game state machine runs deterministically -- the AI never decides game logic.

---

## Mistral AI Integration

Mistral is the brain of InnerPlay. Two models, two roles:

### Mistral Large -- Story Narration Engine
- Generates all in-character dialogue and narration
- Respects world rules, character constraints, and phase behavior directives
- Produces `[SOUND:remove_hvac]` markers inline for real-time sound design
- **Token-by-token streaming** to ElevenLabs -- the player hears Elara's first words while the rest of the response is still generating
- Temperature 0.85 for creative but grounded output; 300 token cap per turn for conversational pacing

### Mistral Small -- Intent Classification
- Classifies every player utterance: intent type (11 categories) + emotional register (5 types) + challenge level
- Runs async after the response streams -- never blocks the voice pipeline
- Feeds the **player style tracker**: empathetic/analytical/nurturing/confrontational scores accumulate across the session
- At Phase 4, the dominant style selects which of 4 revelation variants the player experiences

### Prompt Engineering: 5-Layer Context System
The context builder assembles a **~1,600 token system prompt** per turn that keeps Mistral grounded:
- **Layer 1**: Immutable world physics + Elara's character card (voice rules, forbidden phrases, max sentences)
- **Layer 2**: Phase-specific behavior override (how Elara acts RIGHT NOW)
- **Layer 3**: Last 3 exchanges verbatim (short-term memory)
- **Layer 4**: Compressed earlier history (long-term context)
- **Layer 5**: Live state JSON (trust level, secrets revealed, sounds removed, choices made, style scores)

**Code decides. LLM narrates.** The state machine, rules engine, and ending evaluator are pure TypeScript functions. Mistral never hallucinates game state because it never controls game state.

---

## Architecture: Code Decides, LLM Narrates

This is a **pipeline, not an agentic system**. No autonomous agents, no multi-step tool orchestration. Each step feeds the next sequentially.

| Component | What It Does | Tech |
|---|---|---|
| **State Machine** | Pure functions: initState, advanceBeat, advancePhase, resolveChoice, evaluateEndingCondition | TypeScript |
| **Rules Engine** | Validates player actions against world physics, enforces constraints | TypeScript |
| **Context Builder** | 5-layer system prompt assembly per turn | TypeScript |
| **Style Tracker** | Accumulates player therapy style scores from intent classification | TypeScript + Mistral Small |
| **Sound Cue Parser** | Extracts `[SOUND:x]` markers from full response, strips before TTS | Regex |
| **Sound Engine** | Web Audio API: spatial channels, loop management, crossfade ducking, timeline execution | Web Audio API |
| **Story Content** | 31 YAML files defining world, characters, arc, phases, beats, choices, endings, sounds | YAML |
| **Webhook** | ElevenLabs Custom LLM endpoint: receives conversation, injects context, streams Mistral, updates state | Next.js API Route |

---

## What Makes This Special

**1. Zero-UI gameplay.** Nothing like it exists. You close your eyes to play. The screen goes dark. Your imagination is the renderer.

**2. Code decides, LLM narrates.** Game logic is deterministic TypeScript. The AI handles narration only. No hallucinated game states, no narrative drift, no broken puzzles.

**3. Stories are data, not code.** 31 YAML files define "The Last Session" -- world rules, character cards, phase behaviors, sound timelines, ending conditions. Anyone can write a new story without touching the engine.

**4. Style tracking changes the story.** The game doesn't just track WHAT you choose -- it tracks HOW you play. An empathetic therapist gets a different revelation than a confrontational one. Same story, fundamentally different experience.

**5. Subtractive sound design.** Horror through *removal*. Sounds disappear one by one (elevator, footsteps, HVAC, clock) until only rain remains. Then 2 seconds of absolute silence. Your brain fills the void with dread.

**6. Provider-agnostic engine.** The story content and game engine are decoupled from the AI provider. Swap `mistral-adapter.ts` for a Gemini or Nova adapter -- same story runs on any LLM. Built for portability.

---

## Technical Stack

| Component | Technology |
|---|---|
| Framework | Next.js 16 (React 19, TypeScript, App Router) |
| AI Narration | Mistral Large (`mistral-large-latest`) |
| Intent Classification | Mistral Small (`mistral-small-latest`) |
| Voice I/O | ElevenLabs Conversational AI (WebRTC, STT, TTS) |
| Audio Engine | Web Audio API (spatial sound, ambient layers, dynamic mixing) |
| Story Content | YAML (31 files, 14,000+ lines across 3 stories) |
| Source Code | 34 TypeScript files, ~2,000 lines |
| Deployment | Vercel (serverless) |
| SDK | `@mistralai/mistralai` 1.14.1, `@elevenlabs/react` 0.14.1 |

---

## Neuroscience-Backed Design

Every design decision has a research basis:

- **Loose sketches for onboarding** (not photorealistic) -- forces top-down cortical imagery activation (Kosslyn 2003)
- **10-12 minute sessions** -- alpha power peaks at minute 14, no benefit beyond 20 (Zemla 2023)
- **Sub-bass at 20-30 Hz** -- triggers unease without conscious awareness (Tandy 1998)
- **Silence before the scare** -- brain fills silence with imagination; 2s silence > any loud sound
- **Dread 80%, Terror 15%, Horror 5%** -- Orson Scott Card's hierarchy. Alien shows 4 minutes of monster in 117 minutes of film.
- **Sounds disappearing = dread** -- subtractive sound design is more effective than additive for horror
- **Somatic suggestion** ("You feel cold on your neck") -- works without hypnosis in eyes-closed states (Markmann 2023)

---

## Try It

**Live demo**: [https://mistral-lac.vercel.app](https://mistral-lac.vercel.app)

Put on headphones. Close your eyes. Speak.

---

## Team

Solo developer -- Akash Manmohan

---

## Repository

[https://github.com/AkashiGhost/mistral](https://github.com/AkashiGhost/mistral)
