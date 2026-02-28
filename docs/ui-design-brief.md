# InnerPlay -- UI/UX Design Brief

**Version**: 1.0
**Date**: February 28, 2026
**Author**: InnerPlay Team
**Audience**: UI/UX designers, AI design tools, frontend developers

---

## Table of Contents

1. [Product Overview](#section-1-product-overview)
2. [Current Features](#section-2-current-features)
3. [Future Features](#section-3-future-features)
4. [Landing Page Design Requirements](#section-4-landing-page-design-requirements)
5. [Play Experience Design](#section-5-play-experience-design)
6. [Design Language](#section-6-design-language)
7. [Component Library Needs](#section-7-component-library-needs)
8. [Key Screens](#section-8-key-screens)

---

## Section 1: Product Overview

### What Is InnerPlay?

InnerPlay is a voice-based immersive game platform. The player puts on headphones, closes their eyes, and enters a story world narrated by AI. There is no screen to watch. There is no controller to hold. The game happens entirely in your imagination, guided by AI-generated narration, spatial sound design, and natural voice interaction.

The player speaks naturally to interact with characters in the story. The AI listens, interprets intent, and adapts the narrative in real time. Every playthrough is unique. The story structure is pre-authored, but the narration is generated live -- like jazz where the chord changes are fixed but the melody is improvised.

**The one-sentence pitch**: "Close your eyes. An AI tells you a story. You talk back. The story changes."

### The Core Experience

The experience is built on four pillars:

1. **Darkness** -- The player's screen goes nearly black. The absence of visual stimulation forces the brain to generate imagery from the audio alone. Neuroscience research shows that eyes-closed states with audio stimulation produce vivid mental imagery through top-down cortical engagement.

2. **Voice** -- All interaction is through natural speech. No menus. No buttons (except pause/end, intentionally invisible). The player speaks as themselves, in their own words. The AI character responds with a distinct voice, personality, and emotional range.

3. **Sound Design** -- Cinematic-quality spatial audio creates a sense of physical place. Rain falls to the left (because the window is to the left). Footsteps echo above. An HVAC hum fills the room -- then disappears, one sound at a time, and the disappearance is the horror. Subtractive sound design (removing sounds) creates more dread than additive (adding scary sounds).

4. **Psychological Tension** -- The stories are not jump-scare horror. They operate on the principle of dread (80%), terror (15%), horror (5%). The imagination fills in what the audio suggests. Two seconds of absolute silence before a revelation is more powerful than any loud sound.

### Target Audience

- **Primary**: People who enjoy imagination, daydreaming, and audio content. Listeners of horror podcasts (The Magnus Archives, Darkfield, Sleep No More). Players of narrative games (Firewatch, What Remains of Edith Finch). Readers of interactive fiction.
- **Context**: Bedtime, relaxation, commute -- eyes closed, headphones on. The phone is in their pocket or on the nightstand. The screen is irrelevant once the game starts.
- **Ideal user**: Someone who closes their eyes during a good audiobook and sees the world. Someone who listens to rain sounds to fall asleep. Someone who wants something more than passive listening but less demanding than a video game.
- **Power users**: ~6% of the population are hyperphantasics (extremely vivid mental imagery) and ~10% are hypnotic virtuosos (highly responsive to suggestion). These users will have the most intense experience and will be the evangelists.

### Emotional Positioning

InnerPlay is not a game that tries to look cool. It is a game that tries to *feel* real. The brand is:

- **Quiet, not loud**. No neon. No particle effects. No gamification badges.
- **Literary, not commercial**. The tone is closer to A24 films than AAA games.
- **Intimate, not spectacular**. One voice in your ear, not an orchestra.
- **Dark, not edgy**. The darkness serves the experience, not the aesthetic.

---

## Section 2: Current Features

### Three Stories Available at Launch

Each story is a self-contained 10-12 minute voice experience with its own setting, characters, sound palette, and narrative structure.

#### 1. "The Last Session" -- Psychological Horror / Therapy

- **Setting**: Late-night therapy office, 14th floor. Rain outside. Clock ticking.
- **Player Role**: You are the therapist. Your last patient has arrived.
- **Character**: Elara -- calm, precise, slightly amused. She knows things no patient should know.
- **Hook**: "Your last patient has arrived. She knows too much."
- **Genre Tags**: Psychological Horror, Mystery, Therapy
- **Duration**: ~12 minutes
- **Difficulty**: Medium
- **Mood**: Intimate, cerebral, unsettling
- **Tropes**: Sixth Sense, Shutter Island, Ten Candles, House of Leaves
- **Content Rating**: Mature
- **Unique Mechanic**: Elara IS the narrator -- no separate narrator voice. She describes the room, the sounds, even your own body. The line between patient and puppetmaster dissolves.

#### 2. "The Lighthouse" -- Cosmic Isolation Horror

- **Setting**: Remote lighthouse on a rocky island during a violent storm.
- **Player Role**: You are the lighthouse keeper. Alone.
- **Character**: A voice on the radio -- panicked, desperate, claiming to be from a ship called the Meridian.
- **Hook**: "A storm. A radio. A voice that knows your name."
- **Genre Tags**: Horror-Thriller, Cosmic, Isolation
- **Duration**: ~10 minutes
- **Difficulty**: Medium
- **Mood**: Isolated, cosmic, deeply unsettling
- **Tropes**: The Fog, Annihilation, The Shining, Event Horizon, 1408
- **Content Rating**: Mature
- **Unique Mechanic**: Subtractive sound design -- the storm, the machinery, the foghorn disappear one by one. By the revelation, you are alone in total silence with a voice that has no static. The silence IS the horror.

#### 3. "Room 4B" -- Institutional Surreal Horror

- **Setting**: Decommissioned St. Maren's Hospital at midnight.
- **Player Role**: You are a security guard on the midnight shift.
- **Character**: No NPC -- a second-person narrator describes what you see, hear, and feel.
- **Hook**: "The door won't stay locked. The chart has your name."
- **Genre Tags**: Horror-Thriller, Institutional, Surreal
- **Duration**: ~10 minutes
- **Difficulty**: Hard
- **Mood**: Clinical, oppressive, surreal
- **Tropes**: The Shining, House of Leaves, Session 9, Jacob's Ladder, 1408
- **Content Rating**: Mature
- **Unique Mechanic**: No NPC to talk to. The narrator describes your actions. You explore a physical space. The choices are spatial -- where to go, what to touch, what to read. Visual atmosphere overlay (CSS fog/vignette) because the hospital has a visual presence even on a dark screen.

### Core Feature Set

- **Voice Interaction**: Speak naturally to AI characters. No scripted options -- say whatever you want and the AI interprets your intent (dialogue, action, question, meta-game).
- **Immersive Sound Design**: Spatial audio with binaural elements. Rain, room tone, machinery, clock ticks, cello drones, sub-bass rumbles. Each story has a unique sound palette that evolves as the narrative progresses.
- **Multiple Endings**: 3-4 meaningfully different endings per story, determined by your choices AND how you interact (not just what you choose, but how you speak).
- **Player Style Tracking**: The game silently tracks your interaction style across four dimensions -- empathetic, analytical, confrontational, nurturing. Your dominant style determines which revelation variant you receive. Same story, different truths.
- **Phase-Based Narrative Progression**: Each story moves through 5 phases. Sound design, character behavior, and tension level shift with each phase. The progression is felt, not shown.
- **Real-Time AI Narration**: The narrative text is generated live by AI using the pre-authored story structure as guardrails. No two playthroughs have the same dialogue.
- **Choice Points**: 3 major choices per story where the narrative branches. Choices are presented as cards rising from the bottom of the screen during eyes-closed play -- designed to be glanced at quickly before returning to the audio.

---

## Section 3: Future Features (Show as "Coming Soon")

These should appear on the landing page as a "Coming Soon" or "On the Horizon" section. They communicate that InnerPlay is a platform, not a single experience.

| Feature | Description | Display Priority |
|---|---|---|
| **Community Stories** | User-generated content. Upload your own story, the platform handles sound design, voice casting, and narration. | High |
| **Multiplayer Sessions** | Play with friends. Shared story world, choices affect each other. Two therapists, one Elara. | High |
| **Story Creator Tool** | Build your own horror experiences with an interactive wizard. Write key moments, AI fills in transitions. Two modes: Full Control and Creative Mode. | High |
| **Leaderboards** | Fastest completions, rarest endings discovered, most replays. Competitive layer for replayability. | Medium |
| **Voice Customization** | Choose your AI character's voice from a library. Customize tone, pace, accent. | Medium |
| **Mobile App** | Native iOS/Android experience. Optimized for bedtime play. Lock screen integration -- game continues when phone sleeps. | Medium |
| **Daily Challenges** | New micro-stories every day. 3-5 minute experiences. Quick daily dose of immersive horror. | Medium |
| **Episodic Chapters** | Long-form games (5-10 hours) split into chapters with continuity across sessions. | Lower |
| **Personalized Scene Images** | Your face composited into the onboarding scene images. You see yourself in the therapy office before closing your eyes. | Lower |

**Design Note**: Present these as atmospheric cards with muted icons. No release dates. No promises. The tone should be "imagine what's next" -- aspirational, not promotional. Each card could have a subtle animation (slow fade, gentle pulse) to suggest something alive and waiting.

---

## Section 4: Landing Page Design Requirements

### Overall Feel

The landing page should feel like opening a book in a dark room. The atmosphere should be immediate -- before the user reads a single word, the visual design should communicate: *this is something different. This is quiet. This is immersive.*

The page should NOT feel like a game store, a SaaS product, or a social media platform. It should feel like a theater lobby before the lights go down. Hushed. Expectant. Beautiful in its restraint.

### Mobile-First Design

The primary interaction mode is a phone held in one hand, headphones on, possibly in bed. Design for this context first:

- **Viewport**: 375px - 430px width primary target (iPhone 12-16 range)
- **Scroll behavior**: Smooth, one-handed. No horizontal scrolling. No complex gestures.
- **Touch targets**: Minimum 48px height for all interactive elements
- **Text size**: Body text minimum 16px. Never smaller than 14px for any text.
- **Thumb zone**: Primary actions (story selection, CTA buttons) should be in the bottom 60% of the screen

Desktop is secondary but should scale gracefully to 1440px max content width.

### Hero Section

**Purpose**: Immediately communicate what InnerPlay is and create the desire to try it.

**Layout**:
- Full viewport height (100dvh) or near-full
- Dark atmospheric background -- either a subtle video loop (slow fog drift, rain on glass, flickering light) or a high-quality still image with CSS animation (parallax layers, slow zoom, vignette pulse)
- Content centered vertically and horizontally

**Content**:
- **Tagline** (large, serif, elegant):
  - Primary: "Close your eyes. Open your mind."
  - Alternative options: "The game you play in your head." / "Darkness. Voice. Imagination." / "What do you see when you listen?"
- **Subtitle** (smaller, muted, italic):
  - "AI-narrated immersive stories you play with your voice"
- **Primary CTA**:
  - "Start Playing" or "Enter the Dark"
  - Full-width on mobile, max 320px on desktop
  - Subtle glow effect on the border (accent color `#c4a87c` at low opacity)
  - Scroll-to story selection, or navigate directly to story picker
- **Secondary element**:
  - Small text below CTA: "Headphones required. Free to play."
  - Or an animated headphone icon with a subtle pulse

**Background Treatment**:
- Option A: Slow-moving dark fog/smoke (CSS radial gradients with animation, similar to the existing AtmosphereLayer component but more dramatic)
- Option B: Video loop of rain on dark glass, 5-10 seconds, seamlessly looped, heavily darkened
- Option C: Static dark gradient with floating particle effect (very sparse, very slow)
- Vignette overlay: edges darken further toward pure black (#0a0a0c)

### "How It Works" Section

**Purpose**: Explain the experience in 3 simple steps. This is crucial -- the concept is unfamiliar and users need to understand what they are getting into.

**Layout**: 3-column on desktop, vertical stack on mobile. Each step is a card or panel.

**Steps**:

1. **"Put on headphones"**
   - Icon: Headphones (minimal line icon, accent color)
   - Description: "InnerPlay is built for sound. Every whisper, every silence, every distant footstep is designed for headphones."
   - Background hint: Subtle sound wave pattern

2. **"Close your eyes"**
   - Icon: Closed eye or moon (minimal line icon, accent color)
   - Description: "The screen goes dark. Your imagination takes over. The AI paints the world with words and sound."
   - Background hint: Darkness gradient

3. **"Speak to play"**
   - Icon: Microphone or voice wave (minimal line icon, accent color)
   - Description: "Talk to the characters. Ask questions. Make choices. Your voice shapes the story."
   - Background hint: Subtle waveform

**Design Direction**: Each step card should have a very subtle animated icon (slow breathe, gentle pulse). The cards should feel like they are emerging from darkness -- dark backgrounds with slightly elevated surfaces. Text appears on hover/scroll (or is always visible on mobile). No bright colors. The accent gold (#c4a87c) is used sparingly for icon strokes and borders.

### Story Selection Section

**Purpose**: The main action area. Users choose which story to play.

**Section Header**:
- "Choose Your Story" or "Enter a World" or simply "Stories"
- Serif font, centered, subtle letter-spacing

**Layout**:
- Mobile: Full-width vertical stack, one card per row
- Tablet: 2-column grid
- Desktop: 3-column grid (or a featured card + 2 smaller cards layout)

**Story Cards** (detailed specification in Component Library section):
- Full-width image (16:9 aspect ratio) with dark gradient overlay
- Story title overlaid on image (bottom-left, serif font)
- Hook text / one-line description (italic, muted color)
- Genre tags as small pills/badges (e.g., "Psychological Horror", "Therapy", "Mystery")
- Duration indicator (e.g., "~12 min")
- Difficulty indicator (optional, subtle -- e.g., one to three dots)
- Mood indicator: A single word or short phrase in muted text (e.g., "Intimate & Cerebral")
- On hover/press: Subtle border glow (story-specific accent color), slight scale up (1.02x)

**Story-Specific Accent Colors** (for card borders, tags, and hover states):
- The Last Session: Warm amber/gold `#c4a87c` (therapy warmth turning sinister)
- The Lighthouse: Cold blue-grey `#7c9cb8` (isolation, ocean, radio static)
- Room 4B: Sickly green-white `#8fa88c` (fluorescent institutional lighting)

**Card Image Style**:
- Atmospheric, painterly, not photorealistic
- Dark and moody -- the image should feel like a memory, not a photograph
- Slightly abstract -- help imagination, do not constrain it
- Each image should communicate the setting in one glance

### Feature Highlights Section

**Purpose**: Communicate what makes InnerPlay different from other games or audio experiences.

**Layout**: Alternating rows (image/icon left, text right, then flip) on desktop. Vertical stack on mobile.

**Features to Highlight**:

1. **"Your Voice Shapes the Story"**
   - Description: "No dialogue trees. No option menus. Speak naturally and the AI understands. Say whatever you want -- the characters listen and the story adapts."
   - Icon/Visual: Abstract voice waveform dissolving into text

2. **"Sound-First Design"**
   - Description: "Every sound is intentional. Rain falls to the left because the window is there. When the clock stops ticking, you feel it in your chest. The silence between sounds is where the horror lives."
   - Icon/Visual: Layered sound wave visualization or equalizer bars at very low opacity

3. **"Multiple Endings, Multiple Truths"**
   - Description: "The same story reveals different truths depending on how you play. Your choices matter -- but so does your personality. Empathetic players discover a different secret than confrontational ones."
   - Icon/Visual: Branching path diagram or a tree with multiple endpoints

4. **"AI That Listens"**
   - Description: "The narration is generated live, never pre-recorded. Every playthrough is unique. The AI remembers what you said, how you said it, and what you chose not to say."
   - Icon/Visual: Subtle pulse dot (like the breathing indicator in the game)

**Design Direction**: These should feel like whispered promises, not shouted features. Dark backgrounds. Minimal icons in accent color. Text is the star -- beautifully typeset, well-spaced, readable. Consider having each feature section fade in as the user scrolls (intersection observer animation).

### "Coming Soon" Section

**Purpose**: Show that InnerPlay is a growing platform with an ambitious roadmap.

**Section Header**: "On the Horizon" or "What's Next" or "Coming Soon"

**Layout**: Horizontally scrollable row of cards on mobile (peek effect -- partial next card visible). Grid on desktop (2x4 or 3x3).

**Card Design**:
- Small, square or 4:3 aspect ratio
- Dark elevated background (`#141418`)
- Muted icon (line style, accent color at 50% opacity)
- Feature name (bold, primary text color)
- One-line description (muted text)
- Subtle "coming soon" badge or shimmer effect
- No dates, no percentages, no progress bars

### Social Proof / Testimonials Section

**Purpose**: Build trust and intrigue. Placeholder for now -- will be populated with real testimonials after launch.

**Layout**: Carousel or grid of quote cards.

**Placeholder Content** (replace with real quotes post-launch):
- "I forgot I was wearing headphones." -- Playtester
- "I actually gasped out loud during the revelation." -- Early access user
- "This is what audio games should have been all along." -- Beta tester

**Card Design**:
- Large quotation marks in accent color (decorative, oversized)
- Quote text in serif italic
- Attribution in small UI font, muted
- Dark card background, subtle border

### Footer

**Layout**: Simple, minimal. Dark.

**Content**:
- InnerPlay wordmark (left)
- Links: About, How It Works, Stories, Contact, Privacy Policy
- Social links: Twitter/X, Discord, GitHub (if open source)
- Small text: "Built for headphones. Designed for imagination."
- Copyright

---

## Section 5: Play Experience Design

The play experience is the core of InnerPlay. Everything on the landing page exists to funnel users here. Once they arrive, the design philosophy shifts dramatically: the UI must *disappear*. The less the player sees, the more they imagine.

### Onboarding Flow

**Purpose**: Prepare the player psychologically for an eyes-closed experience. This is not a loading screen -- it is the beginning of the ritual. Every element serves both a technical function (loading audio, requesting mic permission) and a psychological function (building anticipation, priming imagination).

**Step 1: Scene Setting (Story-Specific)**

- Full-screen dark background
- Story scene image(s): atmospheric, painterly, 16:9 aspect ratio
- Each story has 1-3 scenes that introduce the setting visually
- Image appears first, then text fades in after 0.8 seconds (give the image a moment to register)
- Text is overlaid below the image: serif, italic, muted color, centered
- "Continue" button appears after 4 seconds, fades in over 1 second (not instant -- force the player to sit with the image)
- Scene progress dots at the bottom (if multiple scenes)
- Example -- The Last Session:
  - Scene 1: Image of a dim therapy office. Text: "You are a therapist. It's late. Your last patient has arrived."
- Example -- The Lighthouse:
  - Scene 1: Image of a storm-lashed lighthouse. Text: "A storm is building off the coast. You're alone in the lighthouse. The radio hasn't made a sound in weeks."
  - Scene 2: Image of radio equipment. Text: "The radio crackles. A voice: 'Hello? Is someone there?'"
- Example -- Room 4B:
  - Scene 1: Image of a dark hospital exterior. Text: "St. Maren's Hospital. Decommissioned. Your shift starts at midnight."
  - Scene 2: Image of a long hallway. Text: "You step into the hallway. The fluorescent light flickers twice, then holds."

**Step 2: Headphones Prompt**

- Full-screen dark background
- Large text: "Put on headphones" (serif, primary color, centered)
- Subtitle: "Speak naturally. Listen closely." (slightly smaller, secondary color)
- Smaller italic text: "Close your eyes when the countdown ends." (muted)
- Single button: "Ready" -- styled as a pill with accent-colored border, transparent background, uppercase, letter-spaced
- This screen also silently requests microphone permission when the user taps "Ready"

**Step 3: Countdown**

- Full-screen black
- Text: "Close your eyes" (serif, secondary color, centered)
- Large countdown number: 3... 2... 1 (accent color, light font weight, large)
- Each number should fade in and out smoothly
- On 0: the screen transitions to the game session. Audio begins. The first line of the story plays.
- The transition from countdown to game should feel like falling asleep -- a slow fade, not a hard cut

### Game Session (Active Play)

**This is the most important screen in the entire product.** It should be almost nothing.

**Screen State**: Near-black (`#0a0a0c`). The player's eyes should be closed. The screen exists as a safety net -- a glanceable indicator that the game is running.

**Central Element -- Breathing Dot**:
- A single small circle (12px diameter) in the center of the screen
- Color: dim accent (`#8a7550`) when listening, bright accent (`#c4a87c`) when the AI is speaking
- Animation:
  - **Listening (default)**: Slow breathe animation -- opacity pulses from 0.3 to 0.6 over 4 seconds. Mimics calm breathing.
  - **Speaking (AI talking)**: Faster pulse with slight scale change -- opacity 0.5 to 1.0, scale 1.0 to 1.4, over 1.2 seconds.
  - **Phase-aware breathing**: As the story progresses through phases, the breathing animation changes:
    - Phase 1 (calm): 4-second cycle, opacity 0.3-0.6
    - Phase 2 (unease): 3.2-second cycle, opacity 0.3-0.6
    - Phase 3 (tension): 2.5-second cycle, opacity 0.25-0.75
    - Phase 4+ (dread): 6-second cycle, opacity 0.1-0.4 (barely visible -- the dot almost disappears)

**Status Text** (below the dot, extremely subtle):
- Before AI speaks: "preparing the session..." (italic, serif, muted, 0.6 opacity)
- During AI speech: "elara is speaking" (ui font, muted, 0.4 opacity, small caps/letter-spaced)
- During player speech: "listening..." (ui font, muted, 0.4 opacity)

**Transcript Area** (bottom of screen, for accessibility):
- Shows the last thing the AI character said
- Serif italic, muted color, small font size
- Max height: 20vh, overflow hidden
- This exists for users who want to glance at the text, or for accessibility. It should NOT draw attention.

**Atmosphere Overlay** (story-specific, Room 4B only):
- Two overlapping radial gradient layers that drift slowly (CSS animation)
- Simulates dark fog filling the screen
- Vignette effect that darkens the edges
- Phase progression: fog gets darker and slower in later phases
- This layer sits behind all other content (z-index: 0)
- Opacity range: 0.15 (Phase 1) to 0.35 (Phase 4+)

**Bottom Controls** (intentionally almost invisible):
- Two text-only buttons: "pause" and "end session"
- Extremely small (0.65rem), extremely faded (0.25-0.35 opacity)
- UI font, letter-spaced
- These exist for emergency use -- the player should barely notice them
- Separated by a subtle top border line (`#141418`)

**Pause Overlay**:
- Triggered by the "pause" button
- Full-screen dark overlay (black at 85% opacity)
- Centered text: "session paused" (serif, italic, secondary color)
- "resume" button: bordered, UI font, letter-spaced
- All audio should pause/duck when this overlay appears

### Choice Moments

**Trigger**: The AI narrates to a decision point. The game presents 3-4 options as cards.

**Design**:
- Cards rise from the bottom of the screen (fade-in from below)
- Background: gradient from pure black at bottom to transparent at top, covering the bottom 40% of the viewport
- Cards are stacked vertically with spacing
- Each card:
  - Full width, max 400px
  - Min height 48px (touch target)
  - Padding: 16px horizontal, 16px vertical
  - Background: elevated dark surface (`#1c1c22`)
  - Border: 1px solid dim accent (`#8a7550`)
  - Border radius: 8px
  - Text: serif, primary text color, left-aligned
  - On press: brief glow effect, then card stack fades out
- The choice text should be concise (one line if possible) and written as emotional labels, not dialogue (e.g., "Ask how they know -- empathetic curiosity" not "I want to ask how they know")
- After selection, all cards fade out and the game continues

**Critical Design Constraint**: The player's eyes are closed. When a choice appears, they must open their eyes briefly to read the options. The cards must be:
- High contrast (light text on dark background)
- Large enough to read at arm's length
- Few enough to scan in 3-5 seconds
- Visually distinct from the rest of the dark screen (the gradient background makes them "pop")

### Error States

All error states should remain in-theme. No generic browser errors.

**Connection Lost**:
- Centered on screen
- "Connection lost. The session cannot continue." (danger color `#c45c5c`)
- Technical detail in small muted text below (if available)
- "Return home" link in accent color

**Voice Service Quota Exceeded**:
- "Voice service quota exceeded. Please upgrade your ElevenLabs plan to continue."
- Same layout as Connection Lost

**Microphone Permission Denied**:
- "InnerPlay needs your microphone to hear you. Please allow microphone access and try again."
- Include a small instructional hint for the user's platform

**Design Direction**: Errors should feel like the story broke -- not like a software error. The tone is regretful, not clinical. Use the game's serif font, not system UI.

### End Screen

**Trigger**: The story reaches its conclusion. The AI delivers the final line. Audio fades out.

**Design**:
- Full-screen dark background, fade in
- The last line Elara/narrator spoke displayed prominently (serif, italic, secondary color, centered)
- If no text available: "The session has ended."
- Generous vertical spacing
- "Return home" link (muted, small, low opacity -- not a button, just a quiet link)

**Future Enhancement** (design for but do not build yet):
- Story summary card: "Your Story" header, then a brief summary of the choices made
- Your ending name: "You reached: The Shadow Self" (or whatever ending variant)
- Your player style: "You played as: Empathetic Therapist"
- Stats: Duration, choices made, ending rarity ("3% of players reach this ending")
- "Play Again" CTA button (to see a different ending)
- "Share" button (generate a shareable card image with the ending)
- Horizontal divider, then "Try Another Story" section with other story cards

---

## Section 6: Design Language

### Color Palette

The palette is built on near-black backgrounds with warm amber accents. It evokes a late-night therapy office lit by a single desk lamp.

#### Core Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#0a0a0c` | Page background, game session background. Near-black with a hint of blue-grey. |
| `--color-bg-elevated` | `#141418` | Cards, elevated surfaces, borders. One step above background. |
| `--color-bg-surface` | `#1c1c22` | Choice cards, modals, interactive surfaces. Two steps above background. |
| `--color-text-primary` | `#e8e6e3` | Headlines, important text. Warm off-white, not pure white. |
| `--color-text-secondary` | `#9a9590` | Body text, descriptions. Warm grey. |
| `--color-text-muted` | `#5a5550` | Hints, timestamps, metadata. Barely visible. |
| `--color-accent` | `#c4a87c` | Primary accent. Warm amber/gold. Used for CTAs, active indicators, important links. |
| `--color-accent-dim` | `#8a7550` | Muted accent. Borders, inactive states, subtle highlights. |
| `--color-danger` | `#c45c5c` | Error states, warnings. Muted red. |
| `--color-success` | `#5c9a6e` | Confirmations, positive states. Muted green. |

#### Story-Specific Accent Colors

Each story has a secondary accent used for its card border, genre tags, and hover states:

| Story | Color | Hex | Mood |
|---|---|---|---|
| The Last Session | Warm amber | `#c4a87c` | Therapy lamp warmth turning sinister |
| The Lighthouse | Cold blue-grey | `#7c9cb8` | Ocean, isolation, radio frequency |
| Room 4B | Sickly green-white | `#8fa88c` | Fluorescent institutional lighting |

#### Background Gradients

- **Hero gradient**: `linear-gradient(180deg, #0a0a0c 0%, #0d0d12 50%, #0a0a0c 100%)`
- **Card hover glow**: `box-shadow: 0 0 20px rgba(196, 168, 124, 0.08)`
- **Choice card gradient**: `linear-gradient(to top, #0a0a0c 60%, transparent)`
- **Image overlay**: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)`

### Typography

The typography system uses two font families that create a contrast between narrative warmth and interface precision.

#### Font Families

| Token | Stack | Usage |
|---|---|---|
| `--font-body` | `'Georgia', 'Times New Roman', serif` | All narrative text, headlines, story content, button labels. The "voice" of InnerPlay. Warm, literary, readable. |
| `--font-ui` | `system-ui, -apple-system, sans-serif` | Status indicators, metadata, technical UI. Functional, invisible. |
| `--font-mono` | `'Courier New', monospace` | Code-like elements (if any), timestamps. Rarely used. |

**Future Typography Upgrade**: For production, consider replacing Georgia with a premium web font. Candidates:
- **Cormorant Garamond** (Google Fonts) -- More refined, slightly more dramatic
- **Playfair Display** (Google Fonts) -- High-contrast, editorial feel
- **EB Garamond** (Google Fonts) -- Classic, highly readable
- **Spectral** (Google Fonts) -- Designed for digital, excellent readability

#### Font Sizes

| Token | Size | Usage |
|---|---|---|
| `--font-size-xs` | `0.75rem` (12px) | Metadata, timestamps, barely-visible labels |
| `--font-size-sm` | `0.875rem` (14px) | Secondary text, hints, small labels |
| `--font-size-base` | `1rem` (16px) | Body text, button labels, card descriptions |
| `--font-size-lg` | `1.25rem` (20px) | Subheadings, scene text, onboarding prompts |
| `--font-size-xl` | `1.5rem` (24px) | Section headers |
| `--font-size-2xl` | `2rem` (32px) | Page titles, hero tagline on mobile |
| `--font-size-3xl` | `2.5rem` (40px) | Hero tagline on desktop, countdown numbers |

#### Line Heights

| Token | Value | Usage |
|---|---|---|
| `--line-height-tight` | `1.2` | Headlines, large text |
| `--line-height-normal` | `1.5` | Body text default |
| `--line-height-relaxed` | `1.75` | Long-form reading, narrative text |

#### Typography Rules

- Headlines: Serif (`--font-body`), regular weight (400), generous letter-spacing (0.02-0.05em)
- Body text: Serif, regular weight, normal line height
- UI labels: System sans-serif (`--font-ui`), small, letter-spaced (0.04-0.06em), often lowercase
- Narrative text (in-game): Serif, italic, muted color, centered
- No bold weights anywhere in the interface. Weight range: 300-400 only. The design communicates hierarchy through size, color, and spacing -- not weight.
- Text case: Mostly sentence case or lowercase. NO ALL CAPS except for very small UI labels (e.g., "READY" button at 0.875rem with wide letter-spacing).

### Spacing

The spacing system uses a harmonic scale based on 0.25rem (4px) increments.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `0.25rem` (4px) | Tight internal padding |
| `--space-2` | `0.5rem` (8px) | Small gaps, tag padding |
| `--space-3` | `0.75rem` (12px) | Button padding, small card gaps |
| `--space-4` | `1rem` (16px) | Standard padding, card internal spacing |
| `--space-6` | `1.5rem` (24px) | Section internal padding, card gaps |
| `--space-8` | `2rem` (32px) | Section separators, major spacing |
| `--space-12` | `3rem` (48px) | Large section breaks |
| `--space-16` | `4rem` (64px) | Hero-level spacing, major section separators |

**Spacing Philosophy**: Generous whitespace everywhere. The dark background is not "wasted space" -- it IS the design. Content floats in darkness. Elements breathe. Crowded layouts destroy the atmospheric feeling.

### Borders & Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Small tags, badges |
| `--radius-md` | `8px` | Cards, buttons, input fields |
| `--radius-lg` | `16px` | Large cards, story cards, modals |
| `--radius-full` | `9999px` | Pills, circular buttons, the breathing dot |

Border colors: Always use `--color-bg-elevated` for structural borders (subtle, one-step separation). Use `--color-accent-dim` for interactive borders (buttons, selected cards). Never use pure white or high-contrast borders.

### Animation & Transitions

#### Transition Speeds

| Token | Value | Usage |
|---|---|---|
| `--transition-fast` | `150ms ease` | Hover states, small toggles |
| `--transition-normal` | `300ms ease` | Button state changes, card interactions |
| `--transition-slow` | `600ms ease` | Page transitions, fade-in/fade-out |

#### Key Animations

| Animation | Specification | Usage |
|---|---|---|
| **Breathe (default)** | Opacity 0.3 to 0.6, 4s cycle, ease-in-out, infinite | Game session listening indicator (Phase 1) |
| **Breathe (unease)** | Opacity 0.3 to 0.6, 3.2s cycle | Phase 2 breathing |
| **Breathe (tense)** | Opacity 0.25 to 0.75, 2.5s cycle | Phase 3 breathing |
| **Breathe (dread)** | Opacity 0.1 to 0.4, 6s cycle | Phase 4+ breathing (barely visible) |
| **Pulse (speaking)** | Opacity 0.5 to 1.0, scale 1.0 to 1.4, 1.2s cycle | When AI character is speaking |
| **Fade In** | Opacity 0 to 1, 600ms | Page/section entrance |
| **Fade Out** | Opacity 1 to 0, 600ms | Page/section exit |
| **Atmosphere Drift 1** | Translate(0,0) to (8%,-5%), rotate(0 to 2deg), 30s | Fog layer 1 (Room 4B) |
| **Atmosphere Drift 2** | Translate(0,0) to (-6%,4%), rotate(0 to -1.5deg), 39s | Fog layer 2 (Room 4B) |

#### Animation Rules

- All animations should be subtle. If you notice the animation, it is too aggressive.
- Prefer opacity and transform animations (GPU-accelerated) over layout-triggering properties.
- Respect `prefers-reduced-motion`: disable non-essential animations for users who opt out.
- The breathing dot is the only persistent animation during gameplay. Everything else is triggered.
- Scroll-triggered animations on the landing page: fade-in from below (translateY 20px to 0), one at a time, staggered by 100ms.

### Sound-First Design Philosophy

The entire UI is designed with the assumption that the user has headphones on. This affects design decisions in non-obvious ways:

- **No notification sounds or UI sounds on the landing page** -- the first sound the user hears should be the game.
- **No autoplaying video with sound** -- if the hero has video, it must be muted or ambient-only.
- **The headphone prompt during onboarding is a gate** -- do not let users skip it. Audio is not optional.
- **Error messages should not startle** -- if audio is playing when an error occurs, the audio should fade out gracefully (not cut abruptly) before the error is shown.

### Accessibility Requirements

- **WCAG AA minimum** for all text. Contrast ratio 4.5:1 for body text, 3:1 for large text.
- Primary text (`#e8e6e3`) on background (`#0a0a0c`): contrast ratio ~16:1 (passes AAA)
- Secondary text (`#9a9590`) on background (`#0a0a0c`): contrast ratio ~5.5:1 (passes AA)
- Muted text (`#5a5550`) on background (`#0a0a0c`): contrast ratio ~2.7:1 (DOES NOT PASS AA -- use only for decorative/non-essential text, never for content the user needs to read)
- All interactive elements must have visible focus states (accent color outline)
- Transcript area during gameplay serves as text alternative for audio content
- Screen reader support: all images have alt text, all buttons have labels
- Touch targets: minimum 48x48px for all interactive elements

---

## Section 7: Component Library Needs

### Story Card

The primary interactive element on the landing page. Users select their story through these cards.

**Variants**:
- **Full Card** (landing page): Image + title + hook + genre tags + duration + mood
- **Compact Card** (end screen "Try Another"): Image + title + hook only
- **Featured Card** (optional hero variant): Larger, with extended description

**Structure**:
```
+--------------------------------------------------+
|                                                  |
|            [Story Image - 16:9]                  |
|            (dark gradient overlay from bottom)    |
|                                                  |
|  [Genre Tag] [Genre Tag]              [~12 min]  |
|  Story Title                                     |
|  "One-line hook in italic"                       |
+--------------------------------------------------+
```

**Specifications**:
- Image: 16:9 aspect ratio, `object-fit: cover`, atmospheric/painterly style
- Gradient overlay: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)`
- Title: `--font-body`, `--font-size-lg`, weight 400, `--color-text-primary`
- Hook: `--font-body`, `--font-size-sm`, italic, `--color-text-secondary`
- Genre tags: Small pills, `--font-ui`, `--font-size-xs`, uppercase, letter-spaced, story-specific accent color as text, transparent background with accent-dim border
- Duration: `--font-ui`, `--font-size-xs`, `--color-text-muted`, right-aligned
- Border: 1px solid `--color-bg-elevated`
- Border radius: `--radius-lg` (16px)
- Background: `--color-bg-elevated`
- Hover: Subtle glow in story-specific accent color, 1.02x scale, transition 300ms
- Active/Loading: Opacity 0.4 for non-selected cards when one is being loaded

### Atmospheric Button

Used for primary actions: "Start Playing", "Ready", "Resume".

**Specifications**:
- Min height: 48px
- Padding: `--space-3` vertical, `--space-8` horizontal
- Background: transparent
- Border: 1px solid `--color-accent-dim`
- Border radius: `--radius-full` (pill shape)
- Text: `--font-body`, `--font-size-base`, `--color-accent`, letter-spacing 0.1em, uppercase
- Hover: Border color brightens to `--color-accent`, subtle outer glow `0 0 15px rgba(196, 168, 124, 0.1)`
- Active/Press: Background fills slightly `rgba(196, 168, 124, 0.05)`
- Disabled: Opacity 0.5, cursor not-allowed
- Transition: `--transition-normal` (300ms)

### Ghost Button / Text Button

Used for secondary actions: "continue", "pause", "end session", "Return home".

**Specifications**:
- No border, no background
- Text only: `--font-ui`, `--font-size-sm` (or smaller for in-game controls)
- Color: `--color-text-muted`
- Opacity: 0.25-0.6 depending on importance
- Letter-spacing: 0.04-0.06em
- Hover: Opacity increases to 0.8
- Min touch target: 48px (padding around the text ensures this)

### Modal Overlay

Used for onboarding steps, pause screen, future story detail page.

**Specifications**:
- Position: fixed, inset 0
- Background: `--color-bg` (solid, or rgba(10, 10, 12, 0.95) for semi-transparent)
- Z-index: 100 (onboarding), 50 (pause)
- Content: centered flex container
- Animation: fade-in 600ms
- Scroll: hidden (content should fit viewport; if scrollable needed, internal scroll with hidden scrollbar)

### Choice Card

Appears during gameplay at narrative decision points.

**Specifications**:
- Width: 100%, max 400px
- Min height: 48px
- Padding: `--space-4` vertical, `--space-6` horizontal
- Background: `--color-bg-surface` (`#1c1c22`)
- Border: 1px solid `--color-accent-dim`
- Border radius: `--radius-md` (8px)
- Text: `--font-body`, `--font-size-base`, `--color-text-primary`, left-aligned
- Hover: Border brightens to `--color-accent`, subtle background shift
- Container: positioned fixed at bottom, with gradient backdrop from black to transparent
- Animation: cards fade in together (600ms), staggered 100ms between each card

### Progress Indicator (Breathing Dot)

The central visual element during gameplay.

**Specifications**:
- Size: 12px diameter circle
- Border radius: full (circle)
- Colors:
  - Listening: `--color-accent-dim` (`#8a7550`)
  - Speaking: `--color-accent` (`#c4a87c`)
- Animations: See Animation section (breathe, breathe-tense, breathe-dread, pulse)
- Position: center of screen

### Audio Visualizer / Breathing Animation

Future component -- a more sophisticated version of the breathing dot that responds to audio amplitude.

**Concept**:
- Concentric rings or a radial waveform that pulses with the AI voice amplitude
- Extremely subtle -- barely visible, like looking at a candle through frosted glass
- Color: accent color at very low opacity (0.1-0.3)
- Could replace the simple dot in a future version

### Feature Card (Coming Soon)

Used in the "Coming Soon" section on the landing page.

**Specifications**:
- Aspect ratio: square or 4:3
- Background: `--color-bg-elevated` (`#141418`)
- Border radius: `--radius-lg` (16px)
- Padding: `--space-6`
- Icon: 24-32px, line style, `--color-accent` at 50% opacity
- Title: `--font-body`, `--font-size-base`, `--color-text-primary`, weight 400
- Description: `--font-ui`, `--font-size-sm`, `--color-text-secondary`, 2 lines max
- Optional: Subtle shimmer animation on hover (gradient sweep left to right at very low opacity)
- No interaction -- purely informational

### Genre Tag / Badge

Small pill-shaped labels for story metadata.

**Specifications**:
- Padding: `--space-1` vertical, `--space-2` horizontal
- Border: 1px solid (story-specific accent at 40% opacity)
- Border radius: `--radius-sm` (4px) or `--radius-full` for pill shape
- Background: transparent
- Text: `--font-ui`, `--font-size-xs`, uppercase, letter-spacing 0.06em
- Color: story-specific accent color
- No hover state (non-interactive)

### Navigation (Minimal)

**Landing Page**: No persistent navigation bar. The InnerPlay wordmark at the top scrolls with the page. Consider a sticky minimal nav that appears on scroll-down:
- Height: 48px
- Background: `--color-bg` at 90% opacity with backdrop-filter blur
- Content: InnerPlay wordmark (left), "Play" link (right)
- Fade in on scroll past hero section, fade out when scrolled back to top

**Game Pages**: No navigation. The player should not be distracted. Only exit is "end session" or closing the tab.

### Scene Indicator Dots

Used during multi-scene onboarding to show progress.

**Specifications**:
- Size: 6px diameter circles
- Gap: 8px between dots
- Active/completed: `--color-accent`, opacity 1.0
- Upcoming: `--color-text-muted`, opacity 0.3
- Position: absolute bottom of onboarding overlay, centered
- Transition: 300ms ease for color/opacity changes

---

## Section 8: Key Screens

Detailed descriptions of what each screen should look like. A designer should be able to create a mockup from these descriptions alone.

### Screen 1: Landing Page

**Above the Fold (Hero)**:
- Full viewport height. Deep black background with barely perceptible fog movement (two layers of radial gradient drifting slowly, or a subtle dark video loop).
- Center of screen: "InnerPlay" wordmark in serif (Georgia or upgrade font), 2rem, weight 400, letter-spacing 0.05em, warm off-white text. Below it: "close your eyes. listen." in small UI font, muted color, letter-spaced.
- Below that, generous spacing (64px), then "Start Playing" button -- pill shape, amber border, amber text, transparent fill. Subtle outer glow on hover.
- Very bottom of viewport: small text "headphones recommended" at 0.4 opacity, almost invisible.
- The entire hero section should feel like the opening frame of a film. Nothing moves fast. The eye rests. The atmosphere invites.

**Story Selection** (scroll down):
- Section header: "Stories" -- serif, secondary color, centered, small letter-spacing
- Three story cards in a vertical stack (mobile) or 3-column grid (desktop)
- Each card shows the story image, title, hook, genre tags, and duration
- Cards have generous spacing between them (24px gap)
- The section background stays pure black -- no section dividers, no background color changes

**How It Works** (scroll down):
- Section header: "How It Works" -- serif, secondary color, centered
- Three step cards with icons, titles, and descriptions
- On mobile: vertical stack. On desktop: 3-column.
- Each card fades in on scroll (staggered 100ms)
- Icons are minimal line art in accent color

**Feature Highlights** (scroll down):
- 4 feature rows with alternating layout (text left/right on desktop, vertical on mobile)
- Each feature has an atmospheric icon/illustration and descriptive text
- Scroll-triggered fade-in animations

**Coming Soon** (scroll down):
- Section header: "On the Horizon"
- Horizontally scrollable row on mobile (cards peek from the right edge to invite scrolling)
- Grid on desktop
- 6-8 feature cards, dark elevated backgrounds, muted icons, short descriptions

**Testimonials** (scroll down):
- Carousel or 3-column grid of quote cards
- Large decorative quotation marks in accent color
- Quote text in serif italic
- Placeholder content for now

**Footer**:
- Dark, minimal. Wordmark, links, social, copyright.
- "Built for headphones. Designed for imagination."

### Screen 2: Story Detail Page (Future Enhancement)

**Not yet built. Design for future implementation.**

- Full-width header image (story-specific, 16:9 or wider, with dark gradient overlay)
- Story title in large serif text
- Synopsis: 2-3 sentences describing the premise without spoilers
- Content warnings: "Contains: psychological horror, themes of identity, confined spaces"
- Story metadata row: Duration (~12 min), Difficulty (Medium), Endings (4 possible), Content Rating (Mature)
- Genre tags
- "Play This Story" CTA button (atmospheric button style)
- Below: "What players say" section (placeholder)
- Below: "You might also like" section with other story cards

### Screen 3: Onboarding Flow

**Scene Step**:
- Full viewport, fixed position, black background
- Story image centered, max-width 600px, 16:9 aspect ratio, rounded corners (8px)
- Dark gradient overlay on image (darker at bottom for text readability)
- Below image: scene text in serif italic, muted secondary color, centered, max-width 480px, line-height 1.6
- Text fades in 0.8s after scene appears (opacity 0 to 1, 1.5s transition)
- "continue" button appears 4 seconds after scene loads, fades in over 1 second
- Button: ghost style, muted color, small text, letter-spaced, no border
- Scene dots at absolute bottom (if multiple scenes)

**Headphones Step**:
- Full viewport, black background, centered content
- "Put on headphones" -- large serif, primary color
- "Speak naturally. Listen closely." -- serif, secondary color
- "Close your eyes when the countdown ends." -- small serif italic, muted
- "Ready" button -- atmospheric pill button style

**Countdown Step**:
- Full viewport, black background, centered
- "Close your eyes" -- serif, secondary color, above center
- Countdown number (3, 2, 1) -- large (2.5rem), accent color, weight 300, serif
- Each number fades in and out (crossfade style, not hard switch)
- On reaching 0: entire screen fades to pure black and audio begins

### Screen 4: Game Session

**Active Play State**:
- Entire screen is `#0a0a0c` (near-black)
- Center: 12px breathing dot (see Progress Indicator component spec)
- Below dot: status text (extremely subtle, barely readable at arm's length)
- Bottom 20%: transcript of last AI line (serif italic, muted, max 20vh)
- Very bottom: "pause" and "end session" text buttons (almost invisible)
- For Room 4B: atmosphere overlay (fog layers drifting behind everything)
- This screen should be so dark and so minimal that if someone walked in the room, they would think the phone screen was off.

**Choice Overlay State**:
- Bottom 40% of screen: gradient backdrop (transparent to black)
- 3-4 choice cards stacked vertically with 16px gap
- Cards are the only bright elements on screen
- Cards fade in as a group (600ms)
- After selection: cards fade out (300ms), game continues

**Pause State**:
- Full-screen overlay (black at 85% opacity)
- "session paused" centered in serif italic
- "resume" bordered button below
- All game audio pauses

### Screen 5: Ending Screen

**Current (Minimal)**:
- Full viewport, black background, centered content
- Last AI line displayed in serif italic, secondary color, max 32ch width
- Below: "Return home" link, muted, small, low opacity
- Fade-in animation (600ms)

**Future (Enhanced)**:
- Title: "Your Story" (serif, large, centered)
- Story summary card:
  - Your choices listed as brief labels (e.g., "You chose empathy over answers")
  - Your ending: name and brief description ("The Shadow Self -- She was you, all along.")
  - Your style: "You played as an empathetic therapist"
- Stats bar:
  - Session duration
  - Ending rarity: "3% of players reach this ending"
  - Choices aligned/diverged from majority
- Two CTAs:
  - "Play Again" (atmospheric button, accent color) -- to see a different ending
  - "Try Another Story" (ghost button) -- scroll to story cards
- Shareable card: Auto-generated image with the ending name, story art, and a QR code / link. Designed for social media sharing. Dark background, accent color accents, clean typography.

### Screen 6: About / How It Works Page (Future)

**Not yet built. Low priority for initial launch.**

- Extended version of the "How It Works" section from the landing page
- "The Science" section: brief explanations of the neuroscience behind the experience (guided imagery, subtractive sound design, parasympathetic activation)
- "The Technology" section: how the AI pipeline works (simplified, non-technical)
- "The Team" section: founder info (if desired)
- "For Creators" section: teaser for the story creation tool (coming soon)
- Same dark atmospheric design language as the rest of the site

---

## Appendix: Design Reference & Mood Board Direction

### Visual References (Mood, Not Copy)

The following are not templates to copy, but mood anchors for the designer:

- **A24 film posters** (The Witch, Hereditary, The Lighthouse): Dark, textured, minimal text, atmospheric
- **Criterion Collection covers**: Literary, elegant, restrained use of color
- **Noctis (Final Fantasy XV)**: The campfire scenes -- warm light in vast darkness
- **Dark mode interfaces done right**: Linear.app, Raycast, Vercel -- but darker and less "tech"
- **Theater lobbies**: The moment before the lights go down. Hushed. Expectant.
- **Victorian-era book covers**: Serif typography, gold foil on dark leather
- **Darkfield audio experiences**: Binaural audio horror, container-based -- their promotional materials capture the right mood

### What This Is NOT

- Not a gaming platform (no neon, no particle effects, no leaderboard-first design)
- Not a meditation app (no pastels, no lotus flowers, no wellness language)
- Not a podcast player (no timeline scrubbers, no speed controls, no episode lists)
- Not a SaaS dashboard (no sidebar navigation, no metric cards, no admin feel)
- Not a social media platform (no feeds, no likes, no profiles in V1)

### Image Generation Guidance (for AI-Generated Assets)

If generating story card images or scene images with AI:

- **Style**: Atmospheric, painterly, slightly abstract. Dark and moody.
- **NOT photorealistic**: The images should look like memories, not photographs. Imprecise visuals force the player's brain to fill in details (neuroscience-backed).
- **Color temperature**: Cool-to-neutral for horror, warm amber for therapy scenes.
- **Composition**: Strong focal point (a door, a chair, a light) with the rest fading into shadow.
- **Aspect ratio**: 16:9 for scene images, 16:9 for card images.
- **Quality**: High resolution (2x for retina), WebP format, compressed to under 200KB per image.

---

## Appendix: Technical Notes for Developers

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile (default) | < 640px | Single column, full-width cards |
| Tablet | 640px - 1024px | 2-column grids, wider max-width |
| Desktop | > 1024px | 3-column grids, 1440px max content width |

### Performance Considerations

- Use `will-change: transform, opacity` on animated elements (breathing dot, atmosphere layers)
- Lazy-load story card images below the fold
- Preload the first story's onboarding images on the landing page (for instant transition)
- The game session screen should render with zero layout shift -- the breathing dot and status text are the only elements
- CSS animations preferred over JavaScript animations for the breathing/atmosphere effects
- `backdrop-filter: blur()` is expensive on mobile -- use sparingly (only for sticky nav if implemented)

### CSS Custom Properties (Tokens)

All design tokens are defined as CSS custom properties in `:root`. The full token list is documented in Section 6. Components should reference tokens exclusively -- no hardcoded values for colors, spacing, fonts, or transitions.

### Dark Mode Only

InnerPlay has no light mode. The dark theme IS the product. Do not design a light mode variant. The `color-scheme: dark` meta tag should be set in the HTML head to prevent browser UI mismatches.
