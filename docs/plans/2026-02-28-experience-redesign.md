# Experience Redesign — Two New Stories + Visual Onboarding

**Date**: 2026-02-28
**Status**: Approved
**Goal**: Replace Q&A interaction model with narrative-driven experiences. Two new horror stories with different voice models. Visual onboarding with AI-generated images.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Problem Statement

"The Last Session" (therapy format) creates Q&A dynamics — Elara asks, player answers, repeat. The player doesn't feel *taken into a world*. They feel interviewed by a chatbot in costume.

Additionally:
- `[SOUND:x]` markers are spoken aloud instead of stripped before TTS
- Breathing animation feels mechanical
- Pause/resume breaks the ElevenLabs session (likely inactivity timeout)

## Solution

Three stories on a selection screen, each with a different interaction model:

| Story | Voice Model | Gameplay Screen | Status |
|---|---|---|---|
| **The Lighthouse** | Character voice (radio operator talks to you) | Pure dark + breathing dot | NEW |
| **Room 4B** | Narrator voice (2nd person: "You walk down the hall...") | Dark + faint ambient atmosphere | NEW |
| **The Last Session** | Character voice (therapy patient) | Pure dark + breathing dot | EXISTS — keep |

---

## 1. Interaction Models

### Model A: Character Voice (The Lighthouse)

The AI IS a character in the scene talking directly to the player. No narrator. First person.

- Voice on the radio: "Hello? Is someone there? Thank god. Can you see us?"
- Player responds naturally: "I can see lights to the northeast"
- If player is silent (8s+), character fills: "Hello? Are you still there? Please don't leave me."
- Story has momentum — the character keeps talking, events keep happening
- Player's words shape outcomes but don't gate progression

### Model B: Narrator Voice (Room 4B)

The AI describes what the player sees and does. Second person. Characters speak in quotes.

- Narrator: "You step into the hallway. The fluorescent light flickers twice, then holds."
- Clear choice moments: "You could open the chart. Or leave it on the bed."
- Player speaks: "I'll open it" → Narrator: "You flip the cover. Your name. Today's date."
- If player is silent (8s+), narrator advances: "You stand there. The chart is still open."
- More structured branching than Character Voice

### Auto-advance on Silence

Both models: if the player says nothing for ~8 seconds, send a contextual update to ElevenLabs: `"[The player is silent. Continue the story — describe what happens next or have the character fill the silence.]"`

This prevents the dead-air problem that killed The Last Session.

---

## 2. Story A: "The Lighthouse"

**Duration**: 8-10 minutes
**Genre**: Horror/thriller — isolation, wrongness, cosmic
**Voice**: Character — the person on the radio

### Premise
You're a lighthouse keeper on a remote island. A storm is coming. Your radio picks up a distress call. As you guide the ship, things stop making sense. The voice knows your name. The lighthouse beam reveals something in the water. The ship gets closer even though you told it to turn away.

### Phases

**Phase 1: Contact (0:00-2:00)**
Radio crackles. A voice: "Hello? Is someone there?" Normal distress call. They're scared, grateful for help. Player guides them. Everything feels real.
- Sound: Storm building, waves, radio static, lighthouse machinery
- Player calibration: How do they talk to someone in danger? Calm? Commanding? Empathetic?

**Phase 2: Guidance (2:00-4:00)**
You direct the ship. The voice describes what they see. But details mismatch — they describe things about YOUR island they shouldn't know. "Turn the light toward the east cove — the one with the old dock."
- Sound: Storm intensifying, waves closer
- First impossibility: "You know the one" — how does a stranger know your cove?

**Phase 3: Wrongness (4:00-6:00)**
The voice knows your name. Knows you've been alone for months. Describes the inside of the lighthouse. "I can see you through the window. Why won't you wave back?"
- Sound: Storm peaks then starts to DROP. Unnatural quiet building.
- Subtractive horror: machinery sounds disappear one by one

**Phase 4: Revelation (6:00-8:00)**
Storm goes silent. All at once. The voice changes — calm now, not panicked. "There is no ship. There never was. I've been calling this lighthouse for years. You're not the first keeper to answer."
- Sound: 2 seconds absolute silence. Then a low tone. Then only the distant ocean.
- The voice reveals what it is (variant based on player style)

**Phase 5: Resolution (8:00-10:00)**
Based on player's responses throughout: Did you keep helping? Did you confront? Did you try to leave? Different endings.
- Sound: Storm returns warmly, or stays dead silent, or loops

### Revelation Variants
| Player Style | The Voice Is | Horror Type |
|---|---|---|
| Empathetic | The last keeper who answered | Ghost — personal, tragic |
| Analytical | Something that lives in the signal | Cosmic — the radio itself is alive |
| Nurturing | A drowning person from decades ago, replaying | Time loop — the call is real but from 1987 |
| Confrontational | Nothing. The sea. The lighthouse. You. | Existential — there's no one on the other end |

### Endings
1. **Acceptance** — You keep the light on. The voice stays. You're not alone anymore. (Warm, bittersweet)
2. **The Loop** — You hang up. The radio crackles again. Same voice. Same words. (Dread, cyclical)
3. **Release** — You tell them it's OK to stop calling. The static fades. Morning comes. (Sad, peaceful)
4. **Dissolution** — You realize you can't remember arriving at the lighthouse. (Existential, untethered)

---

## 3. Story B: "Room 4B"

**Duration**: 8-10 minutes
**Genre**: Horror/thriller — institutional, body horror adjacent, surreal
**Voice**: Narrator — second person

### Premise
You're a night-shift security guard at an old hospital being decommissioned. Simple job — walk floors, check doors. But Room 4B on the 4th floor won't stay locked. Every pass, it's open. Something inside has moved. Tonight there's a patient chart on the bed. It has your name on it.

### Phases

**Phase 1: The Shift (0:00-2:00)**
Narrator sets the scene. Empty hospital, night. Your footsteps echo. Check doors, mark clipboard. Everything routine. Introduce the building's sounds — they'll disappear later.
- Sound: Footsteps echoing, fluorescent buzz, distant elevator, ventilation, a door somewhere
- Player calibration: How do they respond to being alone? Nervous? Methodical? Curious?

**Phase 2: Room 4B (2:00-4:00)**
You notice Room 4B is open. You closed it last round. Inside: hospital bed, a chart. The chart has your name and today's date. Admission reason: blank.
- Sound: Elevator stops working. Fluorescent buzz gets louder in the silence.
- First choice: Open the chart further? Or close the door and move on?

**Phase 3: Going Deeper (4:00-6:00)**
Each floor you check, something has changed. The elevator arrives on its own. A phone rings in a room with no phone. You find a second chart — filled in. The handwriting is yours.
- Sound: Floor by floor, sounds disappear. By floor 2: only your footsteps and the buzz.
- Second choice: Go to the basement? Call for help? Try to leave?

**Phase 4: The Basement (6:00-8:00)**
The basement is wrong. Hallways that shouldn't exist. A door at the end with light underneath. Behind it: a room identical to 4B. Someone is in the bed.
- Sound: Near silence. Just breathing (the narrator describes it). Then a heartbeat.
- Revelation: Who's in the bed? (Variant based on player style)

**Phase 5: Resolution (8:00-10:00)**
Based on your choices. What does the chart say now? Did you read it? Did you burn it? Can you leave?
- Sound: All hospital sounds return at once, then fade. Or don't.

### Revelation Variants
| Player Style | Who's In The Bed | Horror Type |
|---|---|---|
| Empathetic | You. Sleeping. You can't wake yourself up. | Doppelganger — personal |
| Analytical | No one. The bed is empty. But the chart is filling itself in. | Bureaucratic horror — the system |
| Nurturing | A patient who died here. They look at you. "Finally." | Ghost — unfinished business |
| Confrontational | The bed is empty but the room is Room 4B of a different hospital. One you recognize. | Reality break — where ARE you? |

### Endings
1. **Integration** — You sign the chart yourself. You understand now. The hospital was always yours. (Acceptance)
2. **Consumption** — You wake up in the bed. It's morning. Your shift starts in 12 hours. (Loop)
3. **Release** — You find the exit. The hospital lets you go. It's dawn outside. (Escape)
4. **Dissolution** — The hallways keep going. You're still walking. (No resolution)

---

## 4. Onboarding Flow with Images

### Flow

```
[Landing Page]
  ├── Story card: The Lighthouse (image + title + hook)
  ├── Story card: Room 4B (image + title + hook)
  └── Story card: The Last Session (image + title + hook)
       ↓ (tap one)
[Scene Image 1] — atmospheric image, text fades in, "continue" appears after 4s
       ↓ (tap continue)
[Scene Image 2] — deeper into scene, final text = FIRST LINE you'll hear
       ↓ (tap continue)
[Close Your Eyes] — "Put on headphones. Close your eyes." → 3-2-1 countdown
       ↓ (auto)
[Gameplay] — dark screen, audio begins with that exact last line
```

### Image-to-Audio Bridge
The final text on the last image is EXACTLY the first line the AI speaks when audio starts. This creates a seamless transition from visual to imagination.

**The Lighthouse:**
- Image 2 text: *"The radio crackles. A voice: 'Hello? Is someone there?'"*
- First audio line: "Hello? Is someone there? Thank god. We're taking on water."

**Room 4B:**
- Image 2 text: *"You step into the hallway. The fluorescent light flickers twice, then holds."*
- First audio line: "You step into the hallway. The fluorescent light flickers twice, then holds. Your shift has begun."

### "Continue" Button Behavior
- Button is INVISIBLE for first 4 seconds
- Fades in over 1 second (opacity 0 → 1)
- This forces the player to absorb the image and text before skipping
- Button text: just "continue" — lowercase, subtle

---

## 5. Image Generation Guide

### Style
**Ink wash / graphic novel / sketchy.** Dark palette. NOT photorealistic — the brain fills in details, which primes imagination for eyes-closed gameplay.

**Color palette:**
- The Lighthouse: deep navy, storm grey, amber (lighthouse beam), black
- Room 4B: sickly green (fluorescent), dark grey, white (hospital), black
- The Last Session: warm amber (desk lamp), dark brown (leather), rain blue

### Image Prompts (for AI generation)

#### The Lighthouse — Selection Card
```
Ink wash illustration, dark atmospheric. A lighthouse on a rocky island, beam cutting through a violent storm. A small radio tower on the side. Waves crashing. Style: graphic novel, limited palette (navy, grey, amber beam). Moody, isolated. No text.
```

#### The Lighthouse — Scene Image 1
```
Ink wash illustration, interior of a lighthouse keeper's room. A desk with a radio, a lamp casting warm amber light, rain streaking the window. Storm visible outside. Cozy but isolated. Dark edges fading to black. Style: graphic novel, atmospheric. No text, no people.
```

#### The Lighthouse — Scene Image 2
```
Ink wash illustration, close-up of an old radio on a desk, amber light from a lamp. Static lines suggesting the radio is alive. Rain on the window behind it. Through the window, distant lights on the ocean — a ship? Style: graphic novel, moody, sense of dread beginning. No text.
```

#### Room 4B — Selection Card
```
Ink wash illustration, a long dark hospital hallway seen from one end. Fluorescent lights, one flickering. At the far end, one door is slightly open with light spilling out. Floor is polished, reflecting the lights. Style: graphic novel, sickly green palette, institutional horror. No text.
```

#### Room 4B — Scene Image 1
```
Ink wash illustration, a security guard's desk in an empty hospital lobby at night. A clipboard, a flashlight, a set of keys. Through glass doors, a dark corridor stretches away. One light flickers in the distance. Style: graphic novel, green-grey palette, quiet dread. No text, no people.
```

#### Room 4B — Scene Image 2
```
Ink wash illustration, a hospital room seen from the doorway. A single bed with rumpled sheets. On the bed, a patient chart folder, slightly open. The room is lit by one fluorescent tube. Through the window, it's deep night. Style: graphic novel, clinical horror, something wrong about the scene. No text.
```

#### The Last Session — Selection Card
```
Ink wash illustration, a therapy office at night. Two chairs facing each other, a desk lamp casting warm light. Rain visible on a window. A clock on the wall. The room feels intimate but slightly wrong — shadows too deep. Style: graphic novel, warm amber and dark brown palette. No text.
```

**Save prompts to**: `public/images/prompts.md` (so you can find them easily)
**Save generated images to**: `public/images/stories/[story-id]/` as `card.webp`, `scene-1.webp`, `scene-2.webp`

---

## 6. Technical Architecture Changes

### What stays the same
- ElevenLabs ConvAI → Mistral webhook → TTS pipeline
- Web Audio API for ambient sounds (SoundEngine, synth-sounds)
- Game state polling, choice UI
- State machine, rules engine, style tracker
- Vercel deployment

### What changes

**1. Sound cue stripping** (BUG FIX — critical)
In `route.ts`, the `[SOUND:x]` markers must be stripped from the text BEFORE returning to ElevenLabs. Currently parseSoundCues extracts them but the raw text with markers goes back. Fix: return `cleanText` from parseSoundCues instead of raw `fullText`.

**2. Multi-story support**
- New story directories: `stories/the-lighthouse/`, `stories/room-4b/`
- Each has: `meta.yaml`, `arc.yaml`, `prompts/system.yaml`, `prompts/phase-overrides.yaml`, `sounds/cue-map.yaml`, `sounds/timeline.yaml`, `characters/[name].yaml`
- `config-loader.ts` accepts a story ID parameter
- Story selection sets `CURRENT_STORY_ID` in game state

**3. Onboarding redesign**
- New `OnboardingFlow.tsx` with story selection + image screens
- Images loaded from `public/images/stories/[id]/`
- Slow-reveal text + delayed continue button
- Image-to-audio bridge: last text stored, passed as `firstMessage` override

**4. Auto-advance on silence**
- Track last player speech timestamp
- After 8 seconds of silence during "playing" status, call `conversation.sendContextualUpdate()` with: `"[The player is silent. Continue the story.]"`
- Reset timer on any player speech

**5. Atmosphere layer (Room 4B only)**
- New `AtmosphereLayer.tsx` component
- CSS-only: subtle dark fog/particle animation behind gameplay
- Enabled per-story via meta.yaml `atmosphere: true`

**6. Pause/resume fix**
- Investigate ElevenLabs inactivity timeout
- Options: send periodic `sendUserActivity()` pings during pause, or reconnect on resume

**7. Breathing animation**
- Replace fixed CSS `breathe` class with variable-speed animation
- Speed tied to game phase: slow in Phase 1, faster in Phase 3-4, stops in Phase 4 silence

### File changes summary
```
NEW FILES:
  stories/the-lighthouse/          # Full story directory
  stories/room-4b/                 # Full story directory
  public/images/prompts.md         # AI image generation prompts
  public/images/stories/           # Generated images (user provides)
  src/components/game/AtmosphereLayer.tsx
  src/components/game/StorySelector.tsx

MODIFIED FILES:
  src/app/api/llm/chat/completions/route.ts  # Strip [SOUND:x] from response
  src/components/game/OnboardingFlow.tsx      # Story selection + images
  src/components/game/GameSession.tsx         # Atmosphere layer, phase-aware breathing
  src/context/GameContext.tsx                 # Silence timer, story ID
  src/lib/config-loader.ts                   # Accept story ID parameter
  src/hooks/useSoundEngine.ts                # Per-story timeline
```

---

## 7. Story Writing Guidelines

Apply the quality checklist and anti-slop rules from "The Last Session" to both new stories. Key rules:

### MUST follow:
- Max 3 sentences per response
- At least 1 sensory detail per response (sound, temperature, texture, smell)
- At least 1 physical space anchor per response
- No forbidden phrases (see anti-slop.yaml)
- No hedging (perhaps, maybe, it seems like)
- No purple prose (darkness enveloped, eerie silence, shiver ran down)
- Horror is understated — specificity over drama
- Sounds spoken, not written — contractions, fragments, no semicolons
- Never explain the horror. State it. Stop. Let the player react.

### Adapt per voice model:
- **Character Voice (Lighthouse)**: First person, emotional, can be panicked/scared/calm. Natural speech patterns. Radio static interruptions written as `[SOUND:radio_static]`.
- **Narrator Voice (Room 4B)**: Second person, measured, observational. Never emotional — the narrator describes, doesn't feel. Player's emotions are their own.

---

## 8. Success Criteria

The redesign succeeds if:
1. A player can close their eyes and feel *in the story* within 60 seconds
2. The story progresses without the player needing to ask questions
3. Silence from the player doesn't kill momentum (auto-advance works)
4. Sound design creates atmosphere (subtractive horror works in both stories)
5. The image-to-audio bridge feels seamless
6. At least one of the two new stories clearly outperforms the therapy format
