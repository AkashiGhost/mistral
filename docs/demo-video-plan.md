# InnerPlay — Demo Video Plan

**Target**: Max 4 minutes (aim for 3:40-3:50)
**Format**: 1080p MP4 (4K if possible), YouTube Unlisted
**Voice-over**: Your own voice. NOT AI-generated (hurts credibility per winner research).
**Hackathon**: Mistral AI Worldwide Hackathon

---

## Guiding Principles

These are non-negotiable, derived from 40+ winning projects analyzed in past-winners-analysis.md:

1. **10 seconds and say wow.** The first 10 seconds must hook. No logo, no slide, no title card.
2. **Working demo > slides.** The live demo section is 60% of the video.
3. **ONE undeniable moment > complex feature list.** Elara whispering something impossible in the dark.
4. **Explainable in one sentence.** "An AI therapy patient who turns out to be the one holding you hostage."
5. **Show, don't tell.** Every claim is backed by footage of it working.
6. **Name sponsor tech within 60 seconds.** Mistral Large, Mistral Small, ElevenLabs.
7. **Use your own voice for narration.** AI voiceovers now actively hurt submissions.
8. **Pattern interrupt.** Every other demo opens with slides. We open with BLACK + VOICE.

---

## Video Timeline

### 0:00-0:08 -- THE HOOK (Black Screen + Elara's Voice)

**Visual**: Pure black screen. Nothing.

**Audio**: Faint rain. Room tone. A clock ticking. Then Elara's voice, calm, intimate, slightly too close:

> "Close your eyes. Take a breath in... and let it out slowly. Good. You're in your office now. It's 8:47 PM. Your last appointment."

**Why this works**: Opens a Zeigarnik loop in 3 seconds. The audience is inside the experience before they know what the product is. Pattern interrupt -- every other hackathon demo opens with a slide or a logo. This opens with darkness and a whispered voice.

**Production note**: This is actual game audio captured from a working session, not a voiceover. The rain, clock, and HVAC are the real ambient layers from the Web Audio engine.

---

### 0:08-0:12 -- THE TEXT CARD

**Visual**: White serif text fades in on black:

> "What if a game had no screen?"

Hold 3 seconds. Fade out.

**Audio**: Rain continues. Clock ticking.

---

### 0:12-0:35 -- THE CONCEPT (Your Voice-Over)

**Visual**: Montage (quick cuts, 2-3 seconds each):
- Close-up of hands putting on headphones
- Person lying down, eyes closed, lamp off
- Phone screen dimming to black
- Brief shot of the landing page (story cards visible)

**Audio (your voice, calm, deliberate)**:

> "InnerPlay is a voice game you play with your eyes closed. No screen. No controller. Just your voice and your imagination."
>
> "You are a therapist. Your last patient, Elara, arrives for an emergency session. She's calm -- too calm. And she knows things no patient should know."
>
> "Built on Mistral Large for real-time narration, Mistral Small for intent parsing, and ElevenLabs for character voice."

**Why this works**: PAS framework (Problem-Agitate-Solve) completed in 23 seconds. Sponsor tech named by 0:35. Concept is crystal clear. Judges now understand what they are about to see.

---

### 0:35-0:45 -- TRANSITION INTO DEMO

**Visual**: Show the actual InnerPlay landing page in a browser. Three story cards visible (The Lighthouse, Room 4B, The Last Session). Cursor clicks "The Last Session."

**Audio (your voice)**:

> "Let me show you."

The onboarding flow begins. Screen transitions to the game UI. Visual onboarding sketch of Elara appears briefly, then screen fades to the dark game interface.

---

### 0:45-2:15 -- LIVE DEMO (The Core -- 90 seconds)

This is 60% of the video. This is what wins or loses. Everything else is packaging for this section.

**Structure**: Pre-recorded golden path session. Edit down the best 90 seconds from a 3-5 minute capture.

#### Phase 1: Ordinary World (0:45-1:10, ~25 seconds)

**Visual**: Dark game screen with subtle waveform visualization. Optional: cinematic captions in a serif horror font showing Elara's dialogue, NOT as subtitles but as atmospheric text.

**Audio**: Full ambient soundscape (rain, HVAC hum, clock, faint elevator, footsteps above). Elara speaking:

> "Thank you for seeing me tonight, doctor. The building is strange at this hour."

Player (your voice, natural, in-character): responds with a therapy question.

Elara responds naturally, describing her presenting concern (recurring dreams, memories arriving in the wrong order).

**What the audience sees**: A real voice conversation happening in real-time. Natural back-and-forth. Elara sounds like a real person, not a chatbot.

#### Phase 2: The Wrongness (1:10-1:50, ~40 seconds)

**THIS IS THE MONEY SECTION.**

**Audio**: HVAC cuts out mid-conversation. Subtle but noticeable -- the room gets quieter. Elara, mid-sentence, says something impossible:

> "You had two sugars in your coffee this morning. You always do when you're tired."

Player (your voice): "How do you know that?"

Elara (deflecting, voice shifts slightly formal): "Does it matter how I know? The more interesting question is why you haven't asked me to leave."

**Sound design**: Elevator sound dies. Footsteps above disappear. Only rain and clock remain. The audience FEELS the isolation even through the video.

**Visual**: Optional architecture overlay appears subtly in the corner for 5 seconds showing the real-time pipeline: Speech -> Mistral Small (intent) -> Rules Engine -> Mistral Large (narration) -> ElevenLabs (voice). Then fades.

**Why this works**: The audience experiences the product's core value proposition in real time. The tension is genuine. The sound disappearing is visceral. This is the 30-second undeniable moment.

#### Phase 3: The Peak (1:50-2:15, ~25 seconds)

**Audio**: Elara has stopped asking questions -- she's answering them. The power dynamic has inverted. The cello drone has entered. Only rain remains.

Show a choice moment: the game presents a critical decision. Player responds by voice. Elara's response shifts based on the choice -- demonstrating adaptive narrative.

End on Elara saying something deeply unsettling that implies the session is not what it seems. Her voice drops, contractions disappear:

> "I have been here before, doctor. With every one of them. They all ask the same question eventually."

2 seconds of absolute silence. Then a single low tone.

**Cut to black.**

---

### 2:15-2:40 -- HOW IT WORKS (25 seconds)

**Visual**: Clean architecture diagram (Excalidraw, hand-drawn aesthetic). Max 8-10 boxes. Color-coded.

```
[Player speaks] --> [ElevenLabs ConvAI] --> [Mistral Small: Intent]
                                                    |
                                              [Rules Engine]
                                                    |
                                            [Mistral Large: Story]
                                                    |
                                         [ElevenLabs TTS: Elara]
                                                    |
                                           [Web Audio Mixing]
                                                    |
                                            [Player hears]
```

**Audio (your voice, brisk and technical)**:

> "The pipeline: ElevenLabs handles the voice loop -- VAD, speech-to-text, and character voice. Mistral Small classifies player intent in 50 milliseconds. The rules engine decides what's possible. Mistral Large generates the narrative. Code decides physics. AI narrates."
>
> "Story structure is pre-written in YAML -- like jazz chord changes. The actual narration? Improvised live by Mistral Large every session."

**Why this works**: Judges who care about Technical Execution (30% of scoring) get a clean, confident explanation. Those who don't can follow the visual. The jazz metaphor sticks.

---

### 2:40-3:05 -- WHAT MAKES IT DIFFERENT (25 seconds)

**Visual**: Quick sequence of text cards on black, each appearing for 3-4 seconds with a subtle fade:

1. "Zero UI during gameplay."
2. "Code decides. AI narrates."
3. "Sound-first design -- sounds disappearing IS the horror."
4. "Your personality shapes the ending."

**Audio (your voice)**:

> "During gameplay, there is no screen. No buttons. No menus. You speak, Elara listens, and the story adapts."
>
> "The sound design is subtractive -- sounds disappearing is more terrifying than sounds appearing. By the climax, only rain remains."
>
> "And the ending? It depends on who you are. Empathetic therapists get one revelation. Analytical ones get another. Four endings, shaped by your personality -- not multiple choice."

---

### 3:05-3:25 -- THE VISION (20 seconds)

**Visual**: Quick montage of the three story cards from the landing page (The Lighthouse, Room 4B, The Last Session). Then: concept cards for future genres -- fantasy, mystery, mythology, sci-fi -- flashing briefly.

**Audio (your voice)**:

> "The Last Session is one story. But InnerPlay is a platform. The engine is genre-agnostic -- horror, fantasy, mystery, mythology. Same pipeline, different content."
>
> "Any story. Any character. Any genre. A game engine for your imagination."

---

### 3:25-3:40 -- CALL TO ACTION

**Visual**: Black screen. The live URL appears in clean white text. Below it:

> "Put on headphones. Close your eyes. Play."

Hold 5 seconds.

**Audio**: Elara's voice returns one final time, whispered:

> "I'll be waiting."

Rain fades.

---

### 3:40-3:50 -- END CARD

**Visual**:
- InnerPlay logo (or text wordmark)
- "Built by Akash Manmohan"
- "Mistral AI Worldwide Hackathon 2026"
- Tech stack icons: Mistral, ElevenLabs, Next.js, Vercel

**Audio**: Silence. Or the faintest clock tick.

---

## Production Stack

| Purpose | Tool | Notes |
|---|---|---|
| Screen recording | OBS Studio | Multi-source capture, free, record at 1080p60 |
| Game audio capture | OBS (desktop audio) | Capture game output alongside mic separately |
| Architecture diagram | Excalidraw | Hand-drawn aesthetic, export as PNG |
| Video editing | DaVinci Resolve | Professional-grade, free, color grading |
| Quick captions | CapCut Desktop | Serif horror font for Elara's dialogue |
| Audio waveform viz | Kapwing or After Effects | White waveform on black for demo sections |
| Export | 1080p MP4 | H.264, YouTube Unlisted |

---

## Pre-Recording Checklist

### Must Be Working
- [ ] ElevenLabs quota restored (REQUIRED -- no demo without voice)
- [ ] Elara's voice selected and configured in ElevenLabs ConvAI
- [ ] Landing page loads cleanly (3 story cards, no broken images)
- [ ] Story selection -> onboarding -> game session works end-to-end
- [ ] Voice interaction: player speaks, Elara responds naturally
- [ ] Sound engine: ambient layers play, duck during TTS, sounds disappear on cue
- [ ] At least one "impossible knowledge" moment reliably triggers
- [ ] Choice point appears and responds to voice input
- [ ] Session does not crash for at least 5 minutes of continuous play

### Demo Environment
- [ ] OBS configured: browser source + desktop audio + mic (separate tracks)
- [ ] Browser: Chrome, dark theme, no bookmarks bar, no extensions visible
- [ ] Screen resolution: 1920x1080 or higher
- [ ] Quiet recording environment (no background noise -- ironic for audio game)
- [ ] Headphones for monitoring (not speakers -- avoid feedback)
- [ ] Test recording: check audio levels, no clipping, voice and game balanced

### Content Prep
- [ ] Architecture diagram exported from Excalidraw (PNG, 1920x1080)
- [ ] Text cards designed (black background, white serif text)
- [ ] Genre concept cards (4-5 genre names, minimal design)
- [ ] Closing card with logo, name, hackathon, tech icons

---

## Golden Path Script (What to Say During Live Demo)

This is the pre-planned conversation path to capture on video. Rehearse 5+ times before recording. The goal is a natural-sounding session that reliably hits all the dramatic beats.

### Player Lines (your voice, in-character as therapist)

**Opening (Phase 1)**:
- "Hello, Elara. Thank you for coming in. I know it's late. What brought you here tonight?"
- [Elara describes presenting concern -- dreams, memory disorder]
- "Tell me more about these dreams. What do you see?"
- [Elara gives vivid description]
- "And when did this start?"

**Escalation (Phase 2)**:
- [Elara drops impossible knowledge -- coffee order]
- "Wait -- how do you know about my coffee?"
- [Elara deflects]
- "Elara, I need you to answer my question. How did you know that?"
- [HVAC cuts out. Silence noticeable.]

**Confrontation (Phase 3)**:
- [Elara inverts power dynamic]
- [Choice moment: player must decide how to respond]
- "I think we should end the session here."
- [Elara's response: chilling, the reveal begins]

### Target Captures
Aim for 3-5 complete run-throughs. Edit the best moments from all takes into the final 90-second demo section. Do NOT try to get a perfect single take -- edit power is more valuable than live perfection.

---

## Backup Plan (If Voice Is Broken or Unstable)

### Tier 1: Pre-Recorded Session
- Record a working session as early as possible (even if rough)
- If live capture fails during final recording, use earlier footage
- Audio quality from earlier session + polished voiceover = still effective

### Tier 2: Narrated Walkthrough
- Screen record the UI flow (landing page -> game selection -> onboarding)
- Show the mic-test page demonstrating voice capture working
- Voice-over explains the pipeline while showing code and architecture
- Show terminal logs of the pipeline in action (STT -> intent -> rules -> LLM -> TTS)

### Tier 3: Concept + Architecture
- Voice-over with architecture diagram and story content
- Show the YAML story files, character definitions, sound cue system
- Play pre-generated audio clips (Elara's voice from ElevenLabs, ambient sounds)
- Emphasize "built the engine, the voice integration is the last mile"
- This is the weakest option but still demonstrates technical depth

### At Any Tier
- The hook (0:00-0:08) can use a single pre-generated Elara audio clip
- Architecture section works regardless of demo state
- Vision section works regardless of demo state
- The demo section (0:45-2:15) is the only part that requires working voice

---

## Rehearsal Schedule

| When | What | Duration |
|---|---|---|
| Before any recording | Read this script out loud 3 times | 15 min |
| After code is stable | Golden path run-through (full game session) | 30 min |
| After golden path works | Record 3-5 complete sessions in OBS | 45 min |
| After selecting best clips | Record voice-over narration (non-demo sections) | 20 min |
| Assembly | Edit in DaVinci Resolve | 1-2 hours |
| Final | Watch completed video, fix audio levels, export | 30 min |

**Total production time estimate**: 3-4 hours
**Stop coding deadline**: At minimum 4 hours before submission deadline
**Buffer**: Export and upload 1 hour before deadline minimum

---

## Kill List (Things That Will Lose)

From demo-video-strategy.md research -- avoid these at all costs:

- Starting with a slide, logo, or title card
- Explaining the tech before showing the demo
- Bad audio quality (catastrophically ironic for an audio-first game)
- Saving the best moment for the end (put it in first 10 seconds)
- Not naming Mistral/ElevenLabs within 60 seconds
- Text-heavy slides or long bullet lists
- Running over 4 minutes (hard cut at 3:50, buffer to 4:00)
- Technical deep-dive before demo
- No voiceover (just music + captions feels like a slideshow)
- AI-generated voiceover (judges notice, credibility tanks)
- Showing every feature instead of nailing one moment
- Apologizing or hedging ("we didn't have time to...")

---

## One-Sentence Pitch (for Devpost text description)

> "InnerPlay is a voice-first horror game where you play a therapist, your AI patient knows too much, and the only way out is through the conversation -- built on Mistral Large for adaptive narration, Mistral Small for real-time intent, and ElevenLabs for character voice."

---

## The Undeniable 30-Second Moment

If judges remember one thing, make it this:

Black screen. Rain. A clock ticking. Elara's voice, intimate and precise, says something she cannot possibly know about the player. The player says "How do you know that?" The HVAC cuts out. Silence. Elara says: "Does it matter how I know? The more interesting question is why you haven't asked me to leave."

That is InnerPlay. Everything else in the video exists to set up and contextualize that moment.
