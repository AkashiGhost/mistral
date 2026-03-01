# INNERPLAY DESIGN BIBLE v4.0

**Cinematic darkness. One accent. No compromise.**

Heavily inspired by the Love, Death & Robots design language by Ruformat. Adapted for a voice-first horror game platform — literary where LDR is industrial, intimate where LDR is explosive, but sharing the same absolute commitment to darkness and restraint.

---

## 1. Philosophy

**"Cinematic Brutalism with Literary Intimacy"**

| Principle | LDR Does | InnerPlay Does |
|-----------|----------|----------------|
| Dark-first, full-bleed | Pure black, full-viewport sections, no containers | Same. Black is not a theme — it's the material. |
| One bold accent | `#FF4619` red-orange for brand moments | One vivid warm accent for the only light in the void |
| Minimal UI | No buttons with backgrounds. Text IS the interface. Cursor provides feedback. | Same on landing/catalogue. Gameplay: just the breathing dot. |
| Video-as-content | Autoplay, loop, muted, full viewport | Same. Video is atmosphere, not decoration. |
| Custom cursor | Dual-element (dot + circle), mix-blend-mode: difference | Same technique, adapted to InnerPlay's breathing language |
| Typography as architecture | Condensed bold sans at extreme sizes (100px) | Condensed bold for impact + literary serif for intimacy |
| No grays, no gradients, no shadows | High-contrast black/white/accent only | Same. Gradients only for atmospheric fog and card overlays. |

**The litmus test:** If it looks like a SaaS landing page, delete everything and start over.

---

## 2. Color Palette

**Five colors. That's it.** No exceptions. If a color isn't here, it doesn't exist.

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--black` | `#000000` | 0, 0, 0 | Background of everything. Pure black. Not near-black. |
| `--white` | `#FFFFFF` | 255, 255, 255 | All primary text. Headings. Wordmark. Links. |
| `--accent` | `#E8943C` | 232, 148, 60 | The ONE vivid color. Interactive elements. Breathing dot. Focus outlines. Hover states. The only light source in absolute darkness. |
| `--muted` | `#666666` | 102, 102, 102 | Secondary text. Hints. Timestamps. Labels. |
| `--error` | `#E84040` | 232, 64, 64 | Errors only. "The connection was lost." |

**Why `#E8943C`?** It's a vivid warm amber — the color of a single candle in a dark room, a desk lamp in a noir film, an ember in dead ashes. It's warmer and more alive than LDR's red-orange, fitting InnerPlay's literary horror tone. It reads as "the last light" rather than "danger."

**Contrast ratios on pure black:**
| Pairing | Ratio | Level |
|---------|-------|-------|
| `--white` on `--black` | 21:1 | AAA |
| `--accent` on `--black` | 7.8:1 | AAA |
| `--muted` on `--black` | 5.7:1 | AA |
| `--error` on `--black` | 5.2:1 | AA |

**No grays between black and white.** No `--void-elevated`. No `--void-surface`. No `--bone`. No `--ash`. No `--smoke`. No `--ember-dim`. Those colors were indecisive. This palette commits.

**Story accent protocol:** Each story may have ONE additional color visible in its card/hero image ONLY — never in UI chrome. The accent in images is atmospheric (blue storm light, green fluorescent, warm amber), but the UI accent is always `--accent`.

---

## 3. Typography

### Font Stack

| Role | Font | Fallback | Weight | Usage |
|------|------|----------|--------|-------|
| Display | Bebas Neue | Arial, sans-serif | 400 | Page titles, hero headings, section labels — LARGE (60-100px) |
| Literary | Cormorant Garamond | Georgia, serif | 300, 400 | Story titles, hooks, onboarding text, gameplay text, body copy |
| UI | system-ui | -apple-system, sans-serif | 400, 500 | Labels, hints, buttons, navigation, metadata |

**Why two faces?** The tension between Bebas Neue (bold, industrial, cinematic) and Cormorant Garamond (delicate, literary, haunted) IS InnerPlay's identity. The landing page hits you with Bebas. The story draws you in with Cormorant. The shift from bold to intimate mirrors the shift from browsing to playing.

**Bebas Neue** — Condensed uppercase sans-serif. Designed by Ryoichi Tsunekawa. The same DNA as LDR's BebasHelvetica but pure Bebas. Clean lines, no fuss, maximum impact at large sizes.

**Loading:** Both from Google Fonts, `display=swap`, preloaded in `<head>`. Latin subset only.

### Type Scale

| Token | Size | Line Height | Font | Use |
|-------|------|-------------|------|-----|
| `--type-hero` | clamp(3.5rem, 8vw, 6.25rem) | 1.0 | Bebas Neue | Landing hero title, page headers (60-100px responsive) |
| `--type-section` | 1.375rem (22px) | 1.3 | Bebas Neue | Section labels, category headers, uppercase, letter-spacing 1px |
| `--type-title` | 1.5rem (24px) | 1.3 | Cormorant Garamond 400 | Story titles on cards |
| `--type-lead` | 2.125rem (34px) | 1.55 | Cormorant Garamond 300 | Featured story hook, about page lead text |
| `--type-body` | 1.125rem (18px) | 1.55 | Cormorant Garamond 400 | Body text, story descriptions, hooks |
| `--type-ui` | 0.875rem (14px) | 1.55 | system-ui 500 | Navigation, labels, metadata, buttons |
| `--type-caption` | 0.75rem (12px) | 1.5 | system-ui 400 | Timestamps, hints, footnotes |

### Wordmark

```
"INNERPLAY"
Font: Bebas Neue 400
Size: --type-section (22px)
Color: --white
Letter-spacing: 3px
All uppercase (typed, not CSS transform)
```

Lockups:
- **Wordmark alone** — primary. Used in nav bar, footer.
- **Wordmark + tagline** — "close your eyes" in system-ui, --type-caption, --muted, 8px below.

---

## 4. Layout System

### Full-Viewport Sections (LDR-style)

Every major content area is a full-viewport artboard. No scrolling within sections on landing — each section IS the viewport.

```css
section {
  width: 100vw;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: var(--black);
}
```

### Spacing Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 8px | Tight gaps, inline spacing |
| `--space-sm` | 16px | Card padding, element gaps |
| `--space-md` | 24px | Section padding (mobile), standard margins |
| `--space-lg` | 48px | Desktop margins, major gaps |
| `--space-xl` | 64px | Hero padding, section breaks |

### Persistent Navigation Chrome (LDR-style)

A fixed bar of elements persists across ALL pages at the same positions:

```
Top-left:     Breathing dot (10px) + "INNERPLAY" wordmark
Top-right:    Menu icon (hamburger line) OR close (X)
Bottom-left:  Sound toggle ("sound on" / "sound off") in --muted
Bottom-right: "BEGIN" CTA in --accent
```

All navigation text in system-ui, --type-ui. No backgrounds, no borders. Just text. The custom cursor provides all hover feedback.

### Breakpoints

```css
--bp-tablet: 768px;
--bp-desktop: 1024px;
--bp-wide: 1440px;
```

---

## 5. Custom Cursor (Desktop Only)

**The single most impactful design element.** Adapted from LDR.

### Implementation

```css
/* Hide native cursor on desktop */
@media (hover: hover) and (pointer: fine) {
  body { cursor: none; }
}
```

**Two elements follow the mouse:**

| Element | Size | Style | Behavior |
|---------|------|-------|----------|
| Dot | 10px circle | `--accent` fill, `mix-blend-mode: difference` | Tracks mouse exactly, no lag |
| Circle | 80px circle | 1.5px `--white` border, no fill, `mix-blend-mode: difference` | Follows with slight lag (CSS transition 0.15s or JS lerp). Default: `scale(0.1)`. On hover over interactive elements: `scale(1)` with smooth expand. |

**The `mix-blend-mode: difference` trick:** On black backgrounds, white elements appear white. On white/colored elements, they invert. This creates the "spotlight" effect without any additional code.

```css
.cursor-dot, .cursor-circle {
  position: fixed;
  top: 0; left: 0;
  border-radius: 50%;
  pointer-events: none;
  mix-blend-mode: difference;
  z-index: 2147483647;
  will-change: transform;
}
.cursor-dot {
  width: 10px; height: 10px;
  background: #fff;
}
.cursor-circle {
  width: 80px; height: 80px;
  border: 1.5px solid #fff;
  background: transparent;
  transform: translate(-50%, -50%) scale(0.1);
  transition: transform 0.3s ease;
}
.cursor-circle.active {
  transform: translate(-50%, -50%) scale(1);
}
```

**Mobile:** Custom cursor disabled. Touch targets 48px min. Standard system cursor.

---

## 6. Animation & Motion

### Signature: Breathing Dot

InnerPlay's heartbeat. Appears in nav bar (landing/catalogue), center of screen (gameplay), and loading states.

```css
@keyframes breathe {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
.breathing-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--accent);
  animation: breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Phase-Aware Breathing (Gameplay Only)

| Phase | Duration | Opacity | Feel |
|-------|----------|---------|------|
| 0-1 (calm) | 4000ms | 0.3 → 1.0 | Steady, therapeutic |
| 2 (unease) | 3200ms | 0.3 → 1.0 | Slightly faster |
| 3 (tension) | 2500ms | 0.2 → 1.0 | Urgent |
| 4+ (dread) | 6000ms | 0.1 → 0.4 | Barely there. The silence before the scream. |

### Fog Drift (Landing + Gameplay)

Two overlapping radial gradient layers on pure black.

```css
.fog-layer-1 {
  background: radial-gradient(ellipse 80% 60% at 30% 40%, rgba(30, 30, 30, 0.6), transparent);
  animation: fog-drift-a 30s ease-in-out infinite alternate;
}
.fog-layer-2 {
  background: radial-gradient(ellipse 70% 50% at 70% 60%, rgba(20, 20, 20, 0.4), transparent);
  animation: fog-drift-b 39s ease-in-out infinite alternate;
}
```

### Page Transitions (LDR-style Curtain)

Full-viewport black overlay slides in/out when navigating between pages.

```css
.page-transition {
  position: fixed;
  inset: 0;
  background: var(--black);
  z-index: 9910;
  transform: translateY(-100%);
  transition: transform 0.5s ease-in-out;
}
.page-transition.active {
  transform: translateY(0);
}
```

### Content Enter Animations

| Element | Duration | Effect |
|---------|----------|--------|
| Hero title | 1.2s | Fade-up from 20px below, opacity 0→1 |
| Subtitles/hooks | 0.7s | Fade-in, 200ms delay after title |
| Cards/items | 0.5s per item | Fade-up, stagger 150ms between items |
| Navigation chrome | 0.3s | Fade-in on page load |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  body { cursor: auto; }
  .cursor-dot, .cursor-circle { display: none; }
}
```

---

## 7. Interactive Elements

### The LDR Rule: No Buttons With Backgrounds or Borders

All interactive elements on landing/catalogue pages are **plain text**. The custom cursor provides all hover feedback (circle expands on hover). No backgrounds, no borders, no pill shapes on these pages.

Exceptions:
- **Gameplay choice buttons** — these need visible boundaries since the player may have eyes closed, and touch targets must be obvious. These retain borders.
- **Mobile CTA** — "BEGIN" gets a subtle 1px `--accent` border on mobile (no custom cursor available for feedback).

### Link Styles

```css
a {
  color: var(--white);
  text-decoration: none;
  cursor: none; /* desktop */
}
a.accent {
  color: var(--accent);
}
```

No underlines. No color change on hover. The cursor circle expanding IS the hover state.

### Sound Toggle

```
Bottom-left of every page.
"SOUND ON" / "SOUND OFF"
Font: system-ui, --type-ui, --muted
Toggles background ambient audio
Cookie-persistent (remembers preference)
```

### Menu

Full-screen black overlay. Large text navigation items stacked vertically.

```
Menu items: Bebas Neue, --type-hero size, --white
Stacked vertically, generous spacing (--space-xl between)
Items: STORIES, ABOUT, BEGIN
Close button: "X" top-right, same position as menu icon
```

---

## 8. Component Specs

### 8a. Breathing Dot

```
Size: 10px (nav), 12px (gameplay center)
Shape: circle
Color: --accent (#E8943C)
Animation: phase-aware breathing (Section 6)
Position (nav): next to wordmark, top-left
Position (gameplay): dead center of viewport
```

### 8b. Story Card (Catalogue)

```
Aspect ratio: 16:9
Border-radius: 0 (sharp corners — LDR has no rounded corners)
Background: --black
Border: none (default), 1px solid --accent (hover, desktop only)
Overflow: hidden
Image: atmospheric CSS gradient or actual image, object-fit cover
Gradient overlay: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)

Title: Cormorant Garamond 400, --type-title, --white, inside card (overlaid on image)
Hook: Cormorant Garamond 400 italic, --type-body, --muted, below title, inside card
Metadata: system-ui, --type-caption, --muted ("12 min" | "psychological horror")

Hover (desktop): border --accent, cursor circle expands
  - Hook text and metadata fade in (opacity 0→1, 300ms)
  - Hidden by default, revealed on hover (MUBI scarcity approach)
Mobile: hook always visible, no border animation

Max-width: none (full-bleed on mobile, grid-based on desktop)
```

### 8c. Choice Button (Gameplay Only)

```
Width: 100%, max-width 400px
Min-height: 48px
Padding: 16px 24px
Background: transparent
Border: 1px solid --muted
Border-radius: 0 (sharp)
Color: --white
Font: Cormorant Garamond 400, --type-body
Text-align: left
Hover: border-color --accent
Active: opacity 0.7, transition 100ms
Focus: 3px --accent outline
Enter: fade-in from bottom, 300ms, stagger 150ms
Exit: fade-out 200ms
```

### 8d. Connecting Screen

```
Full black screen.
Centered breathing dot (10px, --accent, breathing animation).
"preparing the session..." — Cormorant Garamond italic, --type-ui, --muted
Nothing else.
```

### 8e. Error Screen

```
Full black screen, centered.
"The connection was lost." — Cormorant Garamond, --type-body, --error
"return home" — system-ui, --type-ui, --muted, below
```

### 8f. Session End Screen

```
Full black screen, centered.
Elara's last line — Cormorant Garamond italic, --type-lead, --muted, max-width 32ch
"return home" — system-ui, --type-caption, --muted at 60% opacity, below
Fade-in 600ms.
```

---

## 9. Page Templates

### 9a. Landing Page

**One full-viewport hero. That's the landing page.**

```
Background: --black, full viewport (100dvh)
Fog: both drift layers active
Video: autoplay, muted, loop, object-fit cover, opacity 0.3 (behind fog)

Center content (flex column, centered):
  Title: "INNERPLAY" — Bebas Neue, --type-hero (60-100px), --white
  Subtitle: "close your eyes" — Cormorant Garamond italic, --type-body, --muted
  [nothing else in the center — no button, no CTA in the hero]

Fixed chrome:
  Top-left: breathing dot + "INNERPLAY" wordmark (smaller, --type-ui)
  Top-right: menu hamburger
  Bottom-left: "SOUND ON" toggle
  Bottom-right: "BEGIN" in --accent, --type-ui, letter-spacing 3px

Entrance choreography:
  0ms:    Fog begins drifting
  600ms:  Title fades up (1.2s)
  1200ms: Subtitle fades in (0.7s)
  1800ms: Chrome fades in (0.3s)
```

**No story cards on landing.** The landing page IS the atmosphere. Stories live on the catalogue page. The landing page does one thing: make you want to enter.

### 9b. Catalogue Page (Stories Library)

```
Fixed chrome: same as landing (wordmark, menu, sound, BEGIN CTA)

Featured Hero (100vh):
  Full-viewport featured story
  Atmospheric background (gradient or image)
  Title: Cormorant Garamond, --type-lead, --white
  Hook: Cormorant Garamond italic, --type-body, --muted
  Genre + duration: system-ui, --type-caption, --muted
  Fog layers active over the image

Stories Grid (below hero):
  Section label: "STORIES" — Bebas Neue, --type-section, --white, letter-spacing 1px
  Grid: 2 columns desktop, 1 column mobile
  Cards: full-bleed within grid, sharp corners, atmospheric backgrounds
  Hook/metadata: hidden on desktop (revealed on hover), always visible on mobile
  Stagger entrance: 150ms per card on scroll (IntersectionObserver)

Coming Soon Section:
  2-3 placeholder cards, pure --black with 1px --muted border (dashed)
  "?" or lock icon centered, --muted at 40% opacity
  "more darkness coming" — system-ui, --type-caption, --muted

Footer:
  "INNERPLAY" — Bebas Neue, --type-ui, --muted at 30% opacity
  No links, no social icons, no noise
```

### 9c. Onboarding Flow

**Scene panels (per story):**
```
Full screen: fixed inset 0, --black background, z-index 100
Image: max-width 600px, 16:9, centered, sharp corners, gradient overlay
Text: Cormorant Garamond italic, --type-body, --muted, max-width 480px, centered
Continue: system-ui --type-caption, --muted, appears after 4s
```

Art style: Charcoal / ink wash. Faces obscured. Loose, imprecise. Periphery dissolves.

**Headphones step:**
```
Full screen, centered.
Headphones icon: 24px stroke SVG, --accent
"PUT ON HEADPHONES" — Bebas Neue, --type-section, --white
"speak naturally. listen closely." — Cormorant Garamond italic, --type-body, --muted
"BEGIN" — system-ui, --type-ui, --accent (plain text, no button border)
```

**Countdown:**
```
Full screen, centered.
"close your eyes" — Cormorant Garamond italic, --type-body, --muted
Number: Bebas Neue, --type-hero, --accent
3... 2... 1... → fade to black → gameplay
```

### 9d. Gameplay Screen

```
Background: pure --black
Fog: active, phase-aware
Center: Breathing dot (12px, --accent) — THE ONLY ELEMENT

No labels. No text. No controls visible by default.
No "elara is speaking." No "listening..."

Hidden controls (tap screen once to reveal):
  "pause" and "end" — system-ui, --type-caption, --muted at 25% opacity
  Auto-hide after 3 seconds

Transcript (accessibility): tap-hold dot to peek.
ARIA-live region: visually hidden, announces for screen readers.
```

### 9e. Choice Overlay

```
Bottom 40% of screen.
Gradient: linear-gradient(to top, --black 60%, transparent)
Buttons: staggered fade-in from below (Section 8c)
After selection: fade-out 200ms
```

---

## 10. Tone of Voice

**Register:** Quiet, cinematic, unflinching. Like a film's opening title card.

| Rule | Good | Bad |
|------|------|-----|
| Sentence case for literary text | "close your eyes" | "Close Your Eyes" |
| UPPERCASE for UI/navigation only | "STORIES", "BEGIN", "INNERPLAY" | "stories", "begin" |
| Never hype | "the screen goes dark" | "immersive experience" |
| Never technical | "preparing the session..." | "connecting to WebSocket" |
| Errors are calm | "The connection was lost." | "Error: timeout" |
| Instructions = invitations | "put on headphones" | "headphones required" |
| No exclamation marks | Always calm. | Never excited! |

**Forbidden in player-facing text:** immersive, experience, innovative, groundbreaking, revolutionary, cutting-edge, next-gen, AI-powered.

**Social links style (if ever added):** Abbreviated plain text only — "IN", "YT", "X" — no icons, no backgrounds.

---

## 11. Accessibility

### Contrast Matrix

| Pairing | Ratio | Level |
|---------|-------|-------|
| --white on --black | 21:1 | AAA |
| --accent on --black | 7.8:1 | AAA |
| --muted on --black | 5.7:1 | AA |
| --error on --black | 5.2:1 | AA |

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Touch Targets

48px minimum on all interactive elements. No exceptions.

### Screen Reader

- ARIA-live region for gameplay transcript
- Alt text on all images
- Skip-to-content link
- Semantic HTML: `<main>`, `<nav>`, `<section>`, `<h1>`-`<h3>`

### Custom Cursor Accessibility

- Disabled entirely with `prefers-reduced-motion`
- Disabled on touch devices (`@media (hover: hover) and (pointer: fine)` only)
- Standard cursor preserved as fallback

---

## 12. Responsive Behavior

| Element | Mobile (<768px) | Desktop (>=1024px) |
|---------|-----------------|-------------------|
| Hero title | 3.5rem (56px) | 6.25rem (100px) |
| Section labels | 1.125rem (18px) | 1.375rem (22px) |
| Story cards | 1 column, full-width | 2 columns, grid |
| Card hooks | Always visible | Hidden, revealed on hover |
| Custom cursor | Disabled (touch) | Active (mouse) |
| Navigation chrome | Simplified (top bar only) | Full persistent chrome (all 4 corners) |
| Fog layers | 1 layer (performance) | 2 layers |
| Page margins | 16px | 48px |
| Menu | Full-screen overlay | Full-screen overlay |

---

## 13. Do's and Don'ts

### Do
- Use pure black `#000000`. Commit.
- Use pure white `#FFFFFF` for text. No off-whites.
- Let the custom cursor be the hover state. No button backgrounds on browse pages.
- Use Bebas Neue at extreme sizes for impact.
- Use Cormorant Garamond for intimacy and literary tone.
- Sharp corners on everything. No border-radius on cards.
- Full-viewport sections. The viewport IS the canvas.
- Video as atmosphere, not decoration.
- Treat empty black space as the primary design element.
- Page transitions (curtain effect) between routes.

### Don't
- Rounded corners on cards or panels (that's SaaS energy).
- Gradients as decoration (only for fog drift and card image overlays).
- More than 5 colors. Ever.
- Button backgrounds or borders on landing/catalogue (except mobile CTAs).
- Gray backgrounds for "elevated" surfaces. There is only black.
- Visible UI during gameplay. The dot alone.
- Light mode. Ever.
- Multiple accent colors. One. `--accent`. That's it.
- Generic sans-serif body text. Cormorant carries the literary DNA.
- Social media icons. Abbreviated text only ("IN", "YT", "X").

---

## 14. Key Differences from v3.0

| Aspect | v3.0 | v4.0 | Why |
|--------|------|------|-----|
| Colors | 9 (void, bone, ash, smoke, ember, ember-dim, void-elevated, void-surface, wound) | 5 (black, white, accent, muted, error) | Fewer = more decisive. LDR uses 3. |
| Black | `#0a0a0c` (near-black) | `#000000` (pure black) | Commit to the void. |
| White | `#e8e6e3` (bone/cream) | `#FFFFFF` (pure white) | Maximum contrast. No warmth — warmth comes from `--accent` only. |
| Accent | `#c4a87c` (muted gold) | `#E8943C` (vivid amber) | Bolder. Visible. The only light source. |
| Display font | Cormorant Garamond everywhere | Bebas Neue for display + Cormorant for literary | Tension between industrial and intimate. |
| Hero title size | 2.5rem (40px) | clamp(3.5rem, 8vw, 6.25rem) (56-100px) | LDR uses 100px. Go big or go home. |
| Card corners | 16px radius | 0 (sharp) | Cinematic. Sharp. No softness. |
| Buttons (landing) | Pill with border | Plain text (cursor = hover state) | LDR has zero buttons with backgrounds. |
| Custom cursor | None | Dual-element with mix-blend-mode | The single biggest visual impact. |
| Page transitions | None | Full-screen curtain slide | Cinematic page navigation. |
| Landing page cards | Story cards on landing | Stories moved to catalogue | Landing = atmosphere only. One job. |
| Surfaces | 3 elevation levels (void, elevated, surface) | 1 level (black) | No layering. Just black and content. |
| Navigation | Inline only | Persistent chrome (4 corners) + full-screen menu | LDR pattern. Consistent across all pages. |

---

## 15. Implementation Checklist

- [ ] Add Bebas Neue to Google Fonts load (400 weight)
- [ ] Replace all near-black (#0a0a0c) with pure black (#000000)
- [ ] Replace bone/cream (#e8e6e3) with pure white (#FFFFFF)
- [ ] Replace ember (#c4a87c) with vivid accent (#E8943C)
- [ ] Collapse 9 color tokens to 5 (--black, --white, --accent, --muted, --error)
- [ ] Remove all --void-elevated, --void-surface, --bone, --ash, --smoke, --ember-dim tokens
- [ ] Hero title: Bebas Neue at clamp(3.5rem, 8vw, 6.25rem)
- [ ] Remove border-radius from all cards (sharp corners)
- [ ] Implement custom cursor (dot + circle, mix-blend-mode: difference)
- [ ] Implement persistent navigation chrome (4 corners)
- [ ] Implement full-screen menu overlay
- [ ] Implement page transition curtain
- [ ] Remove pill CTA borders on desktop landing/catalogue (plain text)
- [ ] Move story cards from landing to dedicated catalogue page
- [ ] Landing page: just hero + fog + video + chrome
- [ ] Build catalogue page: featured hero + stories grid + coming soon
- [ ] Add sound toggle (bottom-left chrome)
- [ ] Add entrance animations (fade-up titles, stagger items)
- [ ] Disable custom cursor on touch devices and reduced-motion
- [ ] Test at 375px, 768px, 1024px, 1440px
