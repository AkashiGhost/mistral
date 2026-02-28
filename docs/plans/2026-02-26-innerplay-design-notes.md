# InnerPlay — Design Notes (Raw from Brainstorm Session)
## Feb 26, 2026

---

## Core Concept

InnerPlay = voice-based immersive games you play in your head. User lies down, closes eyes, and enters a story world. AI narrates, user speaks naturally to interact. Inspired by:
- "Top 10 Scary Games You Can Play in Your Head" book
- Alien audiobook (sound effects, music, character voices, narration)
- The experience of listening to stories before sleep

---

## How It Works (User's Vision)

### Visual Onboarding (eyes open)
- BEFORE immersion: show user sketches/images of characters, world, tools
- Purpose: prime their imagination so they can visualize better when eyes close
- Could be sketches, short video, or character portraits
- Need neuroscience research: what visual priming works best before audio immersion?

### Audio Immersion (eyes closed)
- Story narrated by AI with sound effects, ambient audio, music
- User speaks naturally — not rigid commands
- Always someone "with" the user (companion character, narrator, guide)
- User CANNOT wander off into empty space — there's always a presence guiding them

### Interaction Model
- LLM always listening during the story
- Spaces where user can talk, ask questions, make choices
- User can talk to NPC characters (each with own voice + personality via ElevenLabs)
- NPCs stay IN-UNIVERSE — won't discuss real-world topics
- Natural language input — user says whatever they want
- When user suggests impossible actions:
  - DON'T just deny it
  - Let user reason about it
  - Show WHY it's not possible within the game world's laws/rules
  - Gently guide back to available options

### Choice Architecture
- Natural language choices, not "option A or B"
- Decision tree with limited but meaningful outcomes
- User feels free but is guided toward story beats
- Emergency/tension moments bring user back if they wander
- "We need to go there — there's an emergency" type redirects

---

## Design Decisions (Confirmed)

| Decision | Answer |
|---|---|
| Platform | Mobile + Desktop (mobile-optimized UI) |
| Players | Solo only for hackathon demo |
| Genre | No bias — scientific decision on what's most effective |
| Story count | Pipeline should produce 2 games for demo (1 horror + 1 other TBD) |
| Story length | TBD — 5 or 10 minutes? Need to determine optimal |
| Multiplayer | Future enhancement |
| Heart rate | Future enhancement |
| Brainwave reading | Far future (when tech allows) |

---

## Story Pipeline (Critical Architecture Piece)

User wants a PIPELINE, not a single story:
- Multiple LLM generations stacked together into one coherent story
- Consistent characters, world rules, tone across generations
- Each game has its own universe with its own rules/laws
- Pipeline should be versatile: same system produces horror, adventure, etc.
- Could leverage existing popular stories as foundations (Ramayana, etc.)

### Components needed:
1. World rules definition (universe laws)
2. Character definitions (personality, voice, limits)
3. Story arc structure (beats, branching points)
4. Sound design layer (ambient, effects, music)
5. Visual priming assets (character sketches, world images)
6. Consistency checker (prevent narrative drift)

---

## Target User

- People who enjoy imagination and daydreaming
- Need scientific research on optimal user profile
- Age: TBD based on research
- Context: likely bedtime, relaxation, commute

---

## The "Wow" Factor

1. You're lying down, eyes closed, and the story is SO GOOD you can see everything
2. You can TALK to characters in the world — they respond with their own voice
3. Characters have real personalities but stay in-universe
4. The game gracefully handles impossible requests without breaking immersion
5. Sound design makes it feel REAL (effects, ambient, music)

---

## Hackathon Specific

- Goal: Win 1st place worldwide
- Need to determine: what genre/emotion/story would impress judges most
- Demo should be tight (optimal length TBD)
- 2 games to show pipeline versatility
- Solo only

---

## Open Questions (Need Research)

1. What visual priming method is most effective before audio immersion? (neuroscience)
2. What is the optimal story duration for maximum impact?
3. What genre wins hackathons? What impresses judges?
4. How to build a story generation pipeline with LLMs that maintains consistency?
5. Who is the ideal target user psychologically?
6. What are the game world constraint patterns? How to enforce universe rules?
7. How to handle NPC conversations that stay in-universe?
8. What sound design patterns create maximum immersion?
9. Research "Top 10 Scary Games You Can Play in Your Head" book
