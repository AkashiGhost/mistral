# InnerPlay Architecture

**Voice-based immersive horror game powered by Mistral AI + ElevenLabs Conversational AI**

The player speaks into their microphone. ElevenLabs handles real-time STT and TTS via WebRTC, calling Mistral Large directly with a system prompt injected by the client at session start. There is no custom webhook in the voice path. All game state lives in the browser. Sound is driven by a client-side timeline and keyword detection on AI narration text.

---

## Diagram 1: System Architecture (High-Level)

```mermaid
flowchart TB
    subgraph Browser["Browser (Next.js React App)"]
        UI["Game UI<br/><small>GameSession + OnboardingFlow</small>"]
        GC["Game State<br/><small>GameContext + useReducer</small>"]
        SE["Sound Engine<br/><small>Web Audio API</small>"]
        EL_SDK["ElevenLabs React SDK<br/><small>useConversation hook</small>"]
        SCP["Sound Cue Parser<br/><small>Keyword regex → one-shot cues</small>"]
        TL["Timeline Executor<br/><small>Time-triggered ambient events</small>"]
    end

    subgraph ElevenLabs["ElevenLabs ConvAI Platform"]
        WS["WebRTC Session Manager"]
        STT["STT<br/><small>Speech-to-Text</small>"]
        TTS["TTS<br/><small>Elara's voice</small>"]
    end

    subgraph Mistral["Mistral AI"]
        ML["Mistral Large<br/><small>Story narration, streaming</small>"]
    end

    subgraph Vercel["Vercel (Next.js)"]
        SU["/api/signed-url<br/><small>Agent auth — server-side API key</small>"]
        STATIC["Static Assets<br/><small>Next.js pages, images</small>"]
    end

    subgraph Content["Story Content (TypeScript)"]
        SP["System Prompts<br/><small>story-prompts.ts — per-story</small>"]
        TIMELINES["Sound Timelines<br/><small>useSoundEngine.ts</small>"]
        SYNTH["Synth Sounds<br/><small>synth-sounds.ts — OfflineAudioContext</small>"]
        OB["Onboarding Scenes<br/><small>OnboardingFlow.tsx</small>"]
    end

    %% Session startup
    Browser -- "1. GET /api/signed-url" --> SU
    SU -- "2. signedUrl (temp token)" --> Browser

    %% Voice flow
    UI -- "Mic audio" --> EL_SDK
    EL_SDK -- "3. startSession(signedUrl,<br/>overrides.agent.prompt)" --> WS
    WS --> STT
    STT -- "Transcribed text +<br/>conversation history" --> ML
    ML -- "Streaming response" --> TTS
    TTS -- "WebRTC audio" --> EL_SDK
    EL_SDK -- "Speaker output" --> UI

    %% Client-side sound
    EL_SDK -- "onMessage(aiText)" --> GC
    GC -- "lastAiText" --> SCP
    SCP -- "matched cues" --> SE
    TL -- "time-triggered events" --> SE

    %% Content wiring
    SP -- "prompt override at session start" --> EL_SDK
    TIMELINES -- "timeline events" --> TL
    SYNTH -- "AudioBuffers" --> SE

    %% TTS ducking
    EL_SDK -- "isSpeaking flag" --> SE

    %% Styling
    style Browser fill:#1a1a2e,stroke:#e94560,color:#eee
    style ElevenLabs fill:#0f3460,stroke:#533483,color:#eee
    style Mistral fill:#2b1055,stroke:#d63384,color:#eee
    style Vercel fill:#16213e,stroke:#e94560,color:#eee
    style Content fill:#1a1a2e,stroke:#533483,color:#eee
```

### Component Summary

| Component | Technology | Role |
|-----------|-----------|------|
| **Game UI** | Next.js 16, React, GameSession, OnboardingFlow | Renders transcript overlay, breathing indicator, pause/end controls, onboarding scenes |
| **Game State** | React useReducer (GameContext) | Tracks status, elapsed seconds, isSpeaking, transcript, conversationId — entirely client-side, no server sync |
| **ElevenLabs React SDK** | `@elevenlabs/react` useConversation | Owns WebRTC session: mic capture, STT, TTS playback, onMessage/onModeChange callbacks |
| **ElevenLabs ConvAI** | WebRTC, STT, TTS | Real-time voice I/O — transcribes player speech, calls Mistral directly, synthesizes Elara's voice |
| **Mistral Large** | `mistral-large-latest` via ElevenLabs agent config | Story narration — receives conversation history + system prompt, streams response back to TTS |
| **/api/signed-url** | Next.js API Route (Node.js runtime) | Only server-side API route in the voice path — exchanges `ELEVENLABS_API_KEY` for a short-lived signed URL |
| **System Prompts** | `src/lib/story-prompts.ts` | Per-story TypeScript strings — injected at session start via `overrides.agent.prompt.prompt` |
| **Sound Engine** | `src/lib/sound-engine.ts`, Web Audio API | Manages ambient loops, crossfades, TTS ducking, spatial panning, hard stops |
| **Sound Cue Parser** | `src/lib/sound-cue-parser.ts`, regex | Matches AI narration text against per-story keyword rules → triggers one-shot sound cues |
| **Timeline Executor** | `src/hooks/useSoundEngine.ts` | Fires pre-authored time-based sound events (fade in, fade out, volume adjust, mute all) |
| **Synth Sounds** | `src/lib/synth-sounds.ts`, OfflineAudioContext | Generates all ambient audio programmatically in-browser (no audio files to serve) |
| **Onboarding Flow** | `src/components/game/OnboardingFlow.tsx` | Scene images → headphones prompt → countdown → (the-call: phone ring) → session start |

---

## Diagram 2: Voice Pipeline (Sequence Diagram)

One complete conversation turn from player speech to Elara's voice, with parallel client-side processing.

```mermaid
sequenceDiagram
    autonumber
    participant P as Player
    participant B as Browser<br/>(GameContext)
    participant EL as ElevenLabs<br/>(ConvAI)
    participant ML as Mistral Large
    participant SE as Sound Engine<br/>(Web Audio API)

    Note over P,SE: Player speaks — ElevenLabs listens via WebRTC

    P->>B: Voice input (microphone)
    B->>EL: WebRTC audio stream (continuous)
    EL->>EL: STT transcription (~300ms)
    Note over EL: onMessage(source:"user") → GameContext logs transcript

    Note over EL,ML: ElevenLabs forwards to Mistral with system prompt + history

    EL->>ML: Conversation history + system prompt<br/>(injected at session start from story-prompts.ts)
    ML->>ML: Generate response (~500-800ms to first token)

    loop Streaming response tokens
        ML-->>EL: Text chunk (streaming)
        EL->>EL: TTS synthesis (progressive, ~200ms)
        EL-->>B: WebRTC audio chunk
        B-->>P: Speaker output — Elara's voice
    end

    Note over EL,B: Stream complete — onMessage(source:"ai") fires with full text

    EL->>B: onMessage(aiText) — full narration text
    B->>B: Dispatch AI_TEXT + ADD_TRANSCRIPT to reducer

    par Client-side parallel processing
        B->>SE: parseSoundCues(aiText, storyId)<br/>Regex keyword match → one-shot cue IDs
        SE->>SE: triggerCue(soundId, volume)<br/>30s cooldown per sound ID

    and TTS ducking lifecycle
        EL->>B: onModeChange("speaking") → isSpeaking = true
        B->>SE: startDucking() — ambient volumes -6dB (300ms fade)
        EL->>B: onModeChange("listening") → isSpeaking = false
        B->>SE: stopDucking() — restore base volumes (600ms fade)

    and Elapsed time tracking
        B->>B: setInterval TICK every 1s<br/>elapsedSeconds drives phase display
    end

    Note over B,SE: Timeline events fire independently based on elapsed time

    SE->>SE: Timeline executor polls every 100ms<br/>Fires pre-authored events at specific timestamps<br/>(fade_in, fade_out, hard_stop, mute_all, volume_adjust)
```

### Voice-to-Voice Timing

| Step | Latency | Notes |
|------|---------|-------|
| STT (ElevenLabs) | ~300ms | Real-time transcription via WebRTC VAD |
| Mistral Large first token | ~500-800ms | Streaming — TTS starts on first sentence |
| TTS progressive synthesis | ~200ms | ElevenLabs synthesizes as tokens arrive |
| **Total voice-to-voice** | **~1-1.5s** | Player speaks → Elara responds |
| Sound cue parsing | <5ms | Client-side regex, runs after full text received |
| TTS duck fade-in | 300ms | Ambient -6dB when Elara starts speaking |
| TTS duck restore | 600ms | Ambient returns to base when Elara stops |

---

## Diagram 3: Sound Design Pipeline

How all audio layers are generated, initialized, and driven during a game session.

```mermaid
flowchart TB
    subgraph Onboarding["Onboarding Phase (before session)"]
        RING["Phone Ring<br/><small>the-call only<br/>Web Audio oscillator<br/>440Hz + 480Hz, 2s on / 4s off</small>"]
    end

    subgraph Startup["Session Start (t=0)"]
        EL_WS["ElevenLabs WebRTC<br/>Audio Establishes"]
        DELAY["3s Delay<br/><small>Lets WebRTC audio<br/>stabilize first</small>"]
    end

    subgraph Init["Sound Engine Init (t+3s)"]
        OAC["OfflineAudioContext<br/>Renders 6-13 synthetic sounds<br/>in parallel (Promise.all)"]
        AC["AudioContext Created<br/>+ MasterGain node"]
        REG["Buffers Registered<br/>per story sound palette"]
        START_TL["Timeline Started<br/>setInterval 100ms poll"]
    end

    subgraph Gameplay["During Gameplay"]
        direction TB

        subgraph Timeline["Timeline Events (time-based)"]
            T0["t=0s: start_ambient<br/><small>Loops begin (rain, hvac, clock)</small>"]
            T1["t=210s: fade_out<br/><small>HVAC fades over 4s</small>"]
            T2["t=360s: fade_in<br/><small>Cello drone + sub bass emerge</small>"]
            T3["t=420s: hard_stop<br/><small>Clock stops instantly</small>"]
            T4["t=480s: mute_all<br/><small>0.5s fade — revelation moment</small>"]
            T5["t=482s: fade_in<br/><small>Low tone for revelation</small>"]
            T0 --> T1 --> T2 --> T3 --> T4 --> T5
        end

        subgraph Keyword["Keyword Detection (AI text)"]
            KW1["onMessage(aiText)"]
            KW2["parseSoundCues(text, storyId)<br/><small>Regex rules per story</small>"]
            KW3["cooldown check<br/><small>30s per sound ID</small>"]
            KW4["triggerCue(soundId)<br/><small>One-shot playback</small>"]
            KW1 --> KW2 --> KW3 --> KW4
        end

        subgraph Ducking["TTS Ducking"]
            D1["isSpeaking = true<br/>(Elara speaking)"]
            D2["startDucking()<br/><small>All ambient -6dB<br/>300ms fade</small>"]
            D3["isSpeaking = false<br/>(Elara stops)"]
            D4["stopDucking()<br/><small>Restore base volumes<br/>600ms fade</small>"]
            D1 --> D2 --> D3 --> D4 --> D1
        end

        subgraph Spatial["Spatial Audio"]
            PAN["StereoPannerNode<br/>per channel<br/><small>rain: -0.3L, clock: 0.2R,<br/>hvac: center, etc.</small>"]
        end
    end

    subgraph End["Game End"]
        FADE["fade_all_to_nothing()<br/><small>15-30s graceful fade</small>"]
        DESTROY["engine.destroy()<br/><small>AudioContext.close()<br/>All sources stopped<br/>Buffers cleared</small>"]
        FADE --> DESTROY
    end

    Onboarding --> Startup
    EL_WS --> DELAY
    DELAY --> Init
    OAC --> REG
    AC --> REG
    REG --> START_TL
    Init --> Gameplay
    Gameplay --> End
```

### Sound Palette by Story

| Story | Ambient Loops | One-Shot Cues | Key Timeline Moments |
|-------|--------------|---------------|---------------------|
| **The Last Session** | rain, hvac, clock, cello_drone, sub_bass, low_tone | rain, clock, cello_drone, low_tone | HVAC fades at 3:30, clock hard-stops at 7:00, mute_all at 8:00 for revelation |
| **The Lighthouse** | ocean, wind, creak, foghorn_drone, sub_bass | ocean, wind, creak, foghorn_drone | Wind intensifies at 4:00, creak fades at 6:00, fade_all_to_nothing at 9:00 |
| **Room 4B** | fluorescent_hum, machinery, metal_echo, heartbeat_drone, sub_bass, low_tone | fluorescent_hum, machinery, metal_echo, heartbeat_drone | Machinery hard-stops at 6:00, fluorescent dies at 7:30 |
| **The Call** | phone_static, electrical_hum, sub_bass | footsteps, water_drip, door_creak, keypad_beep, metal_scrape, pipe_clank, heavy_breathing, disconnect_tone | Phone ring plays during onboarding; pickup_click fires on AI first speech |

---

## Key Design Decisions

1. **ElevenLabs calls Mistral directly** — No custom webhook in the voice path. The system prompt is sent from the client at session start via `overrides.agent.prompt.prompt`. ElevenLabs manages the LLM call, conversation history, and TTS internally. This eliminates latency from a server hop and removes all server-side session state.

2. **Single API route** — The only server-side route in the critical path is `/api/signed-url`, which exchanges the server-held `ELEVENLABS_API_KEY` for a short-lived signed URL. The browser SDK uses this URL to open the WebRTC session without exposing the API key.

3. **Client-side state only** — All game state (elapsed time, phase, transcript, speaking state) lives in a React `useReducer`. There is no server polling, no session store, and no database. The session ends when the ElevenLabs WebRTC connection closes.

4. **Keyword-based sound cues** — Instead of having the LLM emit `[SOUND:x]` markers (which requires stripping before TTS), the client parses natural AI narration text against per-story regex rules. When Mistral says "the clock kept ticking", the client matches `\b(clock|tick|ticking)\b` and fires the clock sound. 30-second cooldowns prevent the same cue from retriggering on every utterance.

5. **Deterministic timeline** — Ambient soundscape changes are authored as a time-based event list (e.g., "at t=420s, hard-stop the clock"). The timeline executor polls every 100ms against elapsed game time. This keeps horror pacing consistent regardless of what the player or AI says.

6. **TTS ducking** — When ElevenLabs signals `isSpeaking = true`, the sound engine reduces all ambient channel volumes by -6dB over 300ms. When TTS ends, volumes restore over 600ms. This ensures Elara's voice is always intelligible without muting the atmosphere entirely.

7. **3-second sound engine delay** — The `SoundEngine` initializes 3 seconds after the ElevenLabs session connects. Creating an `AudioContext` plus rendering 6-13 `OfflineAudioContext` buffers concurrently can starve the audio thread and cause the first WebRTC audio packet to fail. The delay gives ElevenLabs priority over the audio subsystem.

8. **All sounds synthesized in-browser** — There are no audio files to serve or preload. Every ambient layer and one-shot cue is generated procedurally using `OfflineAudioContext` (filtered noise, oscillator drones, click transients). This eliminates CDN latency, keeps bundle size minimal, and allows the sound palette to be fully parameterized.
