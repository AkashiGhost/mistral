# InnerPlay Architecture

**Voice-based immersive horror game powered by Mistral AI + ElevenLabs Conversational AI**

The player speaks into their microphone. ElevenLabs handles real-time STT and TTS via WebRTC. Our webhook injects the story engine (state machine, rules, context builder) and streams Mistral Large responses back as SSE. The client polls for game state updates (choices, sound cues, phase transitions) on a separate channel.

---

## System Architecture

```mermaid
flowchart TB
    subgraph Browser["Browser (Next.js React App)"]
        UI["Game UI<br/><small>GameContext + useReducer</small>"]
        SA["Sound Engine<br/><small>Web Audio API</small>"]
        EL_SDK["ElevenLabs React SDK<br/><small>useConversation hook</small>"]
    end

    subgraph ElevenLabs["ElevenLabs ConvAI Platform"]
        STT["Speech-to-Text"]
        TTS["Text-to-Speech<br/><small>Elara's voice</small>"]
        AGENT["Conversational Agent<br/><small>WebRTC session manager</small>"]
    end

    subgraph Vercel["Vercel (Next.js API Routes)"]
        WEBHOOK["/api/llm/chat/completions<br/><small>Custom LLM Webhook</small>"]
        GSAPI["/api/game-state<br/><small>State Polling Endpoint</small>"]
        SESS["Session Store<br/><small>In-memory Map</small>"]

        subgraph Engine["Story Engine"]
            CB["Context Builder<br/><small>5-layer prompt assembly</small>"]
            SM["State Machine<br/><small>Pure functions, dot-path mutations</small>"]
            RE["Rules Engine<br/><small>Intent validation, constraint redirects</small>"]
            SCP["Sound Cue Parser<br/><small>[SOUND:x] extraction</small>"]
            ST["Style Tracker<br/><small>Player therapy style scoring</small>"]
        end
    end

    subgraph Mistral["Mistral AI"]
        ML["Mistral Large<br/><small>Story narration, streaming</small>"]
        MS["Mistral Small<br/><small>Intent classification</small>"]
    end

    subgraph Content["Story Content"]
        YAML["YAML Story Files<br/><small>arc, world, characters,<br/>prompts, sounds, endings</small>"]
        SCHEMA["JSON Schemas<br/><small>Per-file validation</small>"]
    end

    %% Voice flow
    UI -- "Microphone audio" --> EL_SDK
    EL_SDK -- "WebRTC" --> AGENT
    AGENT --> STT
    STT -- "Transcribed text +<br/>conversation history" --> WEBHOOK

    %% Webhook to Mistral
    WEBHOOK --> CB
    CB --> ML
    ML -- "SSE stream<br/>(text chunks)" --> WEBHOOK
    WEBHOOK -- "SSE response<br/>([SOUND:x] stripped)" --> AGENT
    AGENT --> TTS
    TTS -- "WebRTC audio" --> EL_SDK
    EL_SDK -- "Speaker output" --> UI

    %% Post-stream processing
    WEBHOOK --> SCP
    WEBHOOK --> SM
    WEBHOOK --> ST
    ST --> MS
    WEBHOOK --> SESS

    %% State polling
    UI -- "GET /api/game-state<br/>every 3s" --> GSAPI
    GSAPI --> SESS
    GSAPI -- "phase, beat, choices,<br/>sound cues, gameOver" --> UI
    UI --> SA

    %% Content loading
    YAML --> CB
    SCHEMA --> YAML

    %% Styling
    style Browser fill:#1a1a2e,stroke:#e94560,color:#eee
    style ElevenLabs fill:#0f3460,stroke:#533483,color:#eee
    style Vercel fill:#16213e,stroke:#e94560,color:#eee
    style Mistral fill:#2b1055,stroke:#d63384,color:#eee
    style Content fill:#1a1a2e,stroke:#533483,color:#eee
    style Engine fill:#0d1b2a,stroke:#e94560,color:#eee
```

### Component Summary

| Component | Technology | Role |
|-----------|-----------|------|
| **Game UI** | Next.js 16 + React + useReducer | Manages client state, renders choices, controls sound |
| **ElevenLabs ConvAI** | WebRTC, STT, TTS | Voice I/O -- transcribes speech, synthesizes Elara's voice |
| **Custom LLM Webhook** | Next.js API Route (Node.js runtime) | Receives conversation history, injects story context, streams Mistral response |
| **Context Builder** | TypeScript, 5-layer prompt | Assembles world rules + character card + phase override + history + state snapshot |
| **State Machine** | Pure functions, immutable state | Tracks phase/beat progression, choice resolution, ending evaluation |
| **Rules Engine** | Constraint matching | Validates player intents against world physics rules |
| **Sound Cue Parser** | Regex extraction | Extracts `[SOUND:x]` markers from LLM output, strips before TTS |
| **Style Tracker** | Scoring system | Tracks player therapy style (empathetic/analytical/nurturing/confrontational) |
| **Session Store** | In-memory Map | Per-conversation state, 30-min TTL, keyed by ElevenLabs conversation_id |
| **Mistral Large** | `mistral-large-latest` | Story narration -- streaming responses with sound cue markers |
| **Mistral Small** | `mistral-small-latest` | Intent classification -- fast, cheap, runs post-stream |
| **Story YAML** | 8+ YAML files per story | Pre-authored narrative structure: phases, beats, choices, endings, character arcs |

---

## Request Pipeline (Single Turn)

```mermaid
sequenceDiagram
    autonumber
    participant P as Player
    participant B as Browser<br/>(GameContext)
    participant EL as ElevenLabs<br/>(ConvAI)
    participant WH as Webhook<br/>(/api/llm/chat/completions)
    participant CB as Context<br/>Builder
    participant ML as Mistral<br/>Large
    participant MS as Mistral<br/>Small
    participant SS as Session<br/>Store
    participant GS as /api/game-state

    Note over P,GS: Player speaks into microphone

    P->>B: Voice input (microphone)
    B->>EL: WebRTC audio stream
    EL->>EL: STT transcription

    Note over EL,WH: ElevenLabs calls webhook with full conversation history

    EL->>WH: POST /api/llm/chat/completions<br/>{messages: [...], stream: true}

    WH->>SS: getSession(conversation_id)
    SS-->>WH: Session state (or create new)

    Note over WH: Check pending choices

    alt Pending voice choice exists
        WH->>WH: Match player response to choice options<br/>(keyword matching on labels)
        WH->>SS: resolveChoice() + clear pendingChoice
    end

    Note over WH,CB: Build 5-layer system prompt

    WH->>CB: buildContext(config, state, phase, beat)
    CB-->>WH: Layer 1: World rules + character card<br/>Layer 2: Phase override + beat purpose<br/>Layer 3: Recent exchanges (last 6 turns)<br/>Layer 4: Compressed history<br/>Layer 5: State snapshot (JSON)

    Note over WH,ML: Stream narration from Mistral Large

    WH->>ML: chat.stream({model: "mistral-large-latest",<br/>messages, temperature: 0.85, maxTokens: 300})

    loop SSE chunks (real-time)
        ML-->>WH: Text chunk (delta)
        WH->>WH: Strip [SOUND:x] markers from chunk
        WH-->>EL: SSE: data: {delta: {content: "clean text"}}
        EL->>EL: TTS synthesis (progressive)
        EL-->>B: WebRTC audio chunk
        B-->>P: Speaker output (Elara's voice)
    end

    ML-->>WH: Stream complete (finish_reason: "stop")
    WH-->>EL: SSE: data: [DONE]

    Note over WH,SS: Post-stream updates (fire-and-forget)

    par Async state updates
        WH->>WH: parseSoundCues(fullText)<br/>Extract [SOUND:x] markers
        WH->>WH: advanceBeat() + check phase transition
        WH->>WH: evaluateEndingCondition()<br/>(only in final phase)
        WH->>WH: Detect choice beats for next turn
        WH->>MS: Intent classification<br/>(playerText -> emotional register)
        MS-->>WH: {intent, emotionalRegister, challengeLevel}
        WH->>WH: applyIntentScore() — style tracking
        WH->>SS: updateSession(state, pendingChoice,<br/>pendingSoundCues, gameOver)
    end

    Note over B,GS: Client polls for UI updates (every 3 seconds)

    B->>GS: GET /api/game-state?cid=xxx
    GS->>SS: getSession(cid)
    SS-->>GS: Session data
    GS-->>B: {phase, beatIndex, trustLevel,<br/>activeChoice, soundCues, gameOver}
    B->>B: Dispatch STATE_POLL to reducer<br/>Play sound cues via Web Audio API
```

### Pipeline Timing

| Step | Latency | Notes |
|------|---------|-------|
| STT (ElevenLabs) | ~300ms | Real-time transcription via WebRTC |
| Webhook processing | ~5-15ms | Session lookup, choice matching, context building |
| Mistral Large first chunk | ~500-800ms | Time to first SSE chunk (streaming) |
| TTS (ElevenLabs) | ~200ms | Progressive synthesis starts on first sentence |
| Intent classification | ~200-400ms | Mistral Small, runs async post-stream |
| State poll | 3s interval | Non-blocking, UI update channel |

**Total voice-to-voice latency: ~1-1.5 seconds** (STT + webhook + Mistral first chunk + TTS)

---

## Key Design Decisions

1. **ElevenLabs as voice backbone** -- WebRTC handles STT/TTS, custom LLM webhook lets us inject our game engine between transcription and speech synthesis.

2. **Streaming SSE** -- Mistral chunks flow directly to ElevenLabs TTS. Post-stream state updates (sound cues, beat advancement, style tracking) run fire-and-forget after the SSE connection closes.

3. **[SOUND:x] markers** -- Mistral embeds sound cues in its text output. The webhook strips them before forwarding to TTS (so Elara does not say "SOUND colon door creak"). Cues are stored in session state and delivered to the client via polling.

4. **In-memory session store** -- Game sessions last 10-12 minutes max. A simple Map keyed by conversation_id is sufficient. Cold-start reset is acceptable for a hackathon.

5. **Dual Mistral models** -- Large for narration (creative, streaming), Small for intent classification (fast, cheap, async). The intent classifier runs post-stream so it never blocks voice output.

6. **5-layer context** -- System prompt is assembled fresh each turn from world rules, character card, phase overrides, recent exchanges, compressed history, and live state snapshot. This keeps Mistral grounded in the story structure while allowing creative narration.
