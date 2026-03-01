# InnerPlay — Demo Video Plan (Under 2 Minutes)

**Target runtime**: 1:45-1:55 (hard cap: 2:00)
**Format**: 1080p60 MP4, YouTube Unlisted
**Voice-over**: Your own voice — NOT AI-generated (credibility killer per winner research)
**Hackathon**: Mistral AI Worldwide Hackathon 2026
**Live demo**: https://mistral-lac.vercel.app

---

## Guiding Principles

1. **10 seconds and say wow.** No logo intro. No title card. Open cold.
2. **The wow moment IS the demo.** Everything before and after it is packaging.
3. **One undeniable 30-second moment** beats a complex feature list every time.
4. **Name sponsor tech within 60 seconds** — Mistral Large, ElevenLabs.
5. **Show working product.** Never apologize, never hedge, never explain what you "would have" done.
6. **Under 2 minutes is a constraint, not a limitation.** Judges are watching 200 videos. Shorter wins.

---

## The Wow Moment (Design This First)

**Timecode**: 0:10-0:40 (30 seconds)

This is the single moment that wins or loses the submission. Everything else exists to set it up or pay it off.

**What happens on screen and in audio:**

The screen shows the InnerPlay interface during onboarding. A phone graphic is visible.
The phone RINGS — real synthesized audio (Web Audio oscillator, 440Hz + 480Hz pattern).
A caption fades in: "Answer the call."
The player (you) says: "Hello?"
The character voice (ElevenLabs, Mistral Large) responds immediately with urgency and intimacy:
> "Oh thank god. I've been down here for three hours. Please don't hang up."
Static crackles in the background. A dripping sound starts. Sub-bass hum underneath.
Player: "Where are you? Are you hurt?"
The voice shifts — slightly too calm for someone underground:
> "I know exactly where I am. The question is... do you know where YOU are?"
A sound cue fires: a door creak, somewhere far away.
Two seconds of silence.
**Cut to black.** White text: "This is InnerPlay."

This 30-second clip should make anyone watching it reach for their headphones.

---

## Shot-by-Shot Timeline

### 0:00-0:10 — THE HOOK (Black + Audio)

**What's on screen**: Pure black. Nothing.

**Audio**:
- Faint phone static, as if a line is open
- A single ring tone — synthesized, low, real
- Then the voice, intimate, immediately gripping:
  > "Hello? Is anyone there?"

**Why it works**: The audience is inside the experience before they know what the product is. Pattern interrupt — every other hackathon demo opens with slides. This opens with darkness and a stranger's voice.

**Production note**: This is actual game audio from the Web Audio engine. Capture from a real session, not synthesized in post.

---

### 0:10-0:40 — THE WOW MOMENT (Live Demo Excerpt — 30 seconds)

See "The Wow Moment" section above for full detail.

**Visual**: The actual game running in a browser window. Minimal UI — dark background, subtle waveform, phone-ring animation during onboarding. As soon as the call connects, the UI goes nearly black. Only the faintest breathing indicator remains.

**Audio**: Full: the character voice, background static, dripping, sub-bass hum, door creak. All of it live, not post-produced.

**What judges see**: A real conversation happening in real-time. Real latency (~1-1.5s response). Real sound design reacting to what the AI says. A moment of tension that doesn't feel like a demo.

---

### 0:40-0:50 — WHAT IT IS (Your Voice, 10 seconds)

**Visual**: Landing page briefly visible — story card for "The Call" is highlighted.

**Audio (your voice)**:
> "InnerPlay is a voice game you play with your eyes closed. No screen. No controller. Just your voice and your imagination. This is The Call — a 10-minute thriller built on Mistral Large and ElevenLabs."

Keep it fast. One breath. No pausing for effect here — you already did that.

---

### 0:50-1:15 — MORE DEMO (25 seconds)

**What to show**: Continue the session from the wow moment, edited for the best 25 seconds.

Target moments to capture and include (not all of these — pick the 2-3 that land hardest):

1. **The sound shifts.** Static intensifies mid-sentence, footsteps echo, something moves in the pipes. Show that the soundscape is REACTING to the narrative.
2. **The power inversion.** She stops asking for help and starts asking YOU something you cannot easily answer. The emotional weight escalates.
3. **The subtractive moment.** A sound that was present — static, or the distant footsteps — disappears. The silence is louder than anything that preceded it.

**Visual**: Same dark game UI. Show the transcript overlay if it helps judges follow the conversation. Consider adding cinematic captions in a horror-appropriate serif font for the character's key lines.

**Audio**: Everything live from the game. No music overlay. No narration here — let the demo breathe.

---

### 1:15-1:35 — HOW IT WORKS (20 seconds)

**Visual**: Clean architecture diagram — static image, not animated. The one from architecture-diagram.md, simplified to 6-7 boxes. Hand-drawn aesthetic (Excalidraw).

```
Player speaks
     |
     v
ElevenLabs ConvAI (WebRTC) — VAD + STT
     |
     v
Mistral Large — story narration, streaming
     |
     v
ElevenLabs TTS — character voice
     |
     v
Browser sound engine — keyword cues + timeline + ducking
     |
     v
Player hears a living world
```

**Audio (your voice, brisk — this is the fastest section)**:
> "ElevenLabs handles the voice loop — WebRTC, speech-to-text, character voice. Mistral Large is the character. It receives the conversation history and streams narration directly to TTS. In parallel, the browser sound engine runs keyword detection on every AI response and fires audio cues — footsteps, static, door creaks — without the AI needing to do anything special. Sound is code. Story is AI."

One breath. Under 20 seconds. Move on.

---

### 1:35-1:50 — THE CLOSE (15 seconds)

**Visual**: Black screen. White text fades in:

> mistral-lac.vercel.app

Below it, smaller:

> "Put on headphones. Close your eyes. Answer the call."

Hold 5 seconds.

**Audio**: The character's voice returns, one line, barely above a whisper:
> "I'll be here."

Static. Silence.

---

### 1:50-2:00 — END CARD

**Visual**:
- "InnerPlay"
- "Built by Akash Manmohan"
- "Mistral AI Worldwide Hackathon 2026"
- Logos: Mistral, ElevenLabs, Next.js, Vercel

**Audio**: Silence, or the faintest clock tick. Hold 10 seconds. Let it breathe.

---

## Full Script (Narration Lines Only)

Lines you say out loud. Rehearse until these feel natural, not read.

| Timecode | Who | Line |
|---|---|---|
| 0:40-0:50 | You | "InnerPlay is a voice game you play with your eyes closed. No screen. No controller. Just your voice and your imagination. This is The Call — a 10-minute thriller built on Mistral Large and ElevenLabs." |
| 1:15-1:35 | You | "ElevenLabs handles the voice loop — WebRTC, speech-to-text, character voice. Mistral Large is the character. It receives the conversation history and streams narration directly to TTS. In parallel, the browser sound engine runs keyword detection on every AI response and fires audio cues — footsteps, static, door creaks — without the AI needing to do anything special. Sound is code. Story is AI." |
| 1:48 | Character (game audio) | "I'll be here." |

Everything else is game audio, captured live.

---

## The Golden Path (What to Say During Demo Recording)

Pre-plan your side of the conversation. Rehearse 5+ times before recording. The goal is natural delivery that reliably hits the dramatic beats. Do NOT try for a perfect single take — record 3-5 sessions, edit the best moments.

### Your Lines (in-character as the person who answered the phone)

**Opening**:
- [Phone rings — you say nothing, let it ring twice]
- "Hello?"
- [Character responds]
- "Who is this? Where are you?"
- [Character explains she's underground, scared]
- "Okay. Okay, stay calm. Are you hurt?"

**Escalation** (after the first strange comment):
- "How do you know that?"
- [Character deflects]
- "I need you to stay focused. Can you see a way out?"

**The inversion** (after she starts asking you things):
- "What are you asking me?"
- [Let the silence sit]
- "...I'm still here."

**Target beats to capture**:
1. The first wrong note — she says something she shouldn't know
2. A sound changes without explanation (static spikes, footstep appears, something drips)
3. The power inversion moment — she's not scared anymore
4. A silence that feels like the walls are closing in

---

## Technical Setup

### Recording Stack

| Purpose | Tool | Notes |
|---|---|---|
| Screen recording | OBS Studio | Free. Multi-source capture. Record at 1080p60. |
| Game audio capture | OBS — Desktop Audio source | Capture game output as a SEPARATE track from your mic. This is critical. |
| Mic capture | OBS — Microphone/Aux source | Separate track. You need to edit these independently. |
| Architecture diagram | Excalidraw | Hand-drawn aesthetic. Export 1920x1080 PNG, dark background. |
| Video editing | DaVinci Resolve | Free. Color grade the demo sections darker. Cut on sound events, not on silence. |
| Captions (optional) | CapCut Desktop | For the character's key lines — serif horror font, white on black. Subtitles, not overlays. |
| Export | H.264, 1080p, 24/25/30fps | YouTube Unlisted upload. |

### OBS Scene Setup

Create two OBS scenes:

**Scene 1 — Game Capture**
- Source: Window Capture (Chrome browser, game running)
- Source: Desktop Audio (game output — Web Audio)
- Source: Microphone (your voice)
- Set audio tracks: Game audio on Track 1, Mic on Track 2

**Scene 2 — Architecture Slide**
- Source: Image (architecture PNG)
- Source: Microphone only (no game audio here)

Record the demo section and architecture section as separate OBS recordings if it's easier to manage.

### Browser Setup Before Recording

- Chrome, dark theme, zoom at 100%
- Hide bookmarks bar (View > Always Show Bookmarks Bar: off)
- Disable all extensions (or use a clean Chrome profile)
- Turn off notifications (Windows Focus Assist: Alarms Only)
- Screen resolution: 1920x1080

---

## Audio Setup — How to Make Game Audio Come Through Clearly

This is the most important technical detail for a voice-first game demo. Bad audio is instantly disqualifying.

### The Problem
The game audio (character voice + sound engine) and your mic voice both need to be audible in the recording, at the right balance, without clipping or muddying each other.

### The Solution: Separate OBS Audio Tracks + Mix in Edit

1. **In OBS audio settings**: Route Desktop Audio to Track 1, Microphone to Track 2. Record both simultaneously.
2. **Export to DaVinci Resolve**: You'll have two separate audio tracks you can level independently.
3. **Target levels**:
   - Character voice (game audio): -6 to -3 dBFS peaks — loud, clear, present
   - Ambient sound engine: -18 to -12 dBFS — audible but not competing with speech
   - Your mic voice: -9 to -6 dBFS — slightly quieter than character, you're not the star here
4. **Do NOT use OBS audio mixer to balance in real-time.** Set it and forget it during recording. Fix balance in post.

### Headphone vs. Speaker Recording
- Record with headphones, not speakers.
- Speaker playback will create feedback or bleed into your mic.
- Your voice should NEVER be audible in the game audio track and vice versa.

### Test Recording Checklist
Before any final take, do a 30-second test:
- [ ] Record 30 seconds of game audio playing, you speaking
- [ ] Play back in OBS — check both audio tracks are captured
- [ ] Import test clip into DaVinci Resolve — verify two independent audio tracks
- [ ] Check peaks: no clipping (no red), no silence (no flatline)
- [ ] Check the character voice is intelligible when played through laptop speakers (simulate judge's setup)

### One Critical Rule
**The character voice must be clearly intelligible through laptop speakers without headphones.** Judges may not be wearing headphones. If the ambient audio drowns the character, you lose the demo.

---

## Editing Notes (DaVinci Resolve)

### Color Grade
- Game demo sections: push shadows down, add slight blue-green tint. The game should look dark and cinematic.
- Architecture section: neutral — no grade. Clarity over atmosphere.
- Black screens: true black (0, 0, 0) — no grey.

### Cut Strategy
- Cut ON audio events, not on silence. When a sound fires (door creak, static spike), cut immediately after.
- The silence after the door creak IS a beat. Don't cut through it.
- The power inversion moment should land with a hard cut to black or a single sustained frame.

### Pacing
- The demo section (0:10-1:15) should feel fast. If it feels slow, cut tighter.
- The architecture section (1:15-1:35) should feel brisk, almost rushed. It's a necessary technical beat, not a showcase.
- The close (1:35-1:50) should breathe. Let the silence sit.

---

## Pre-Recording Checklist

### Product Must Be Working
- [ ] Live URL loads: https://mistral-lac.vercel.app
- [ ] Story "The Call" is selectable
- [ ] Onboarding: scenes display, phone ring fires during onboarding countdown
- [ ] Session start: WebRTC connects, character voice plays within 2 seconds
- [ ] Voice interaction: player speaks, character responds within 1.5 seconds
- [ ] Sound engine: static, dripping, sub-bass hum audible in first 30 seconds
- [ ] Keyword cues fire: say "footsteps" or trigger the keyword — sound plays
- [ ] TTS ducking works: ambient audio drops when character speaks, returns when she stops
- [ ] Session runs stable for at least 8 minutes without crash or API error
- [ ] ElevenLabs quota is not exhausted (check dashboard before recording)

### Recording Environment
- [ ] Quiet room — no HVAC noise, no traffic, no other people
- [ ] Door closed
- [ ] Phone on silent
- [ ] Windows notifications off
- [ ] Mic tested — no pops, no room echo, no hum
- [ ] OBS configured with two separate audio tracks
- [ ] Test recording reviewed (see checklist above)

### Assets Ready
- [ ] Architecture diagram (Excalidraw, exported as PNG 1920x1080, dark background)
- [ ] Closing card (black background, white text, logos)
- [ ] End card graphic

---

## Rehearsal + Production Schedule

| When | Task | Time |
|---|---|---|
| Before recording | Read this script out loud 3 times | 15 min |
| Before recording | Play through the full story once without recording | 15 min |
| Before recording | Set up OBS, run test recording, verify audio | 20 min |
| Recording session | Record 3-5 complete demo sessions, keeping OBS running the whole time | 45 min |
| Recording session | Record architecture voice-over (no game running, mic only) | 10 min |
| Editing | Import all takes, select best 30 seconds for wow moment, best 25 seconds for follow-up demo | 30 min |
| Editing | Assemble full timeline, add text cards and closing | 30 min |
| Editing | Mix audio levels, color grade, final review | 30 min |
| Export | 1080p H.264, upload to YouTube Unlisted | 15 min |

**Total estimated production time**: 3-3.5 hours
**Stop coding and start this**: At minimum 4 hours before submission deadline
**Upload to YouTube**: At minimum 1 hour before deadline (YouTube processing time)

---

## Backup Plan (If Voice AI Is Broken During Recording)

### Tier 1 (Use First): Earlier Session Footage
Record a working session as early as possible — even rough quality. If voice breaks during final recording, use best moments from earlier captures. A polished voice-over over slightly older footage beats no demo.

### Tier 2: Narrated Walkthrough
- Screen record: landing page, story selection, onboarding, the phone ring
- Show the phone ring firing (this is synthesized in-browser — always works)
- Show the browser console with live transcript scrolling
- Voice-over over architecture diagram explaining what would happen next
- This demonstrates the engine, the sound design, and the architecture. Weak but honest.

### Tier 3: Concept Video
- Show onboarding scenes + phone ring + architecture diagram
- Play pre-captured audio clips of character voice from ElevenLabs (test generation)
- Voice-over ties it together
- Weakest option. Only use if Tier 1 and Tier 2 are both impossible.

---

## Kill List — Things That Will Lose

- Opening with a slide, logo, or title card
- Explaining the tech before showing the demo
- Bad audio — ironic for a voice game, immediately disqualifying
- Saving the wow moment for the end (it must be in the first 40 seconds)
- Running over 2:00
- Not naming Mistral and ElevenLabs within 60 seconds
- AI-generated voice-over narration (judges notice, credibility drops)
- Apologizing or hedging ("we ran out of time", "ideally this would...")
- Showing every feature instead of nailing one moment
- Letting silence go too long in sections 0:40-1:35

---

## One-Sentence Pitch

> "InnerPlay is a voice-first thriller game where you close your eyes, a stranger calls asking for help, and the only way forward is through the conversation — built on Mistral Large for live character narration and ElevenLabs for real-time voice."

---

## The Undeniable 30-Second Moment (Summary)

Black screen. Phone ring. "Hello?" She responds — urgent, scared, real. Something drips in the background. The static crackles. Then she says something that makes no sense for someone trapped underground. A door creaks, far away. Silence. "This is InnerPlay."

That is the entire submission. Everything else is context for that.
