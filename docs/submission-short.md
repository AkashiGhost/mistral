# InnerPlay -- Submission Text Variants

## Ultra-Short (500 chars max)

**InnerPlay** is a voice-only immersive horror game where you close your eyes, speak, and play. Zero UI. Pure imagination. Powered by Mistral Large for dynamic in-character narration and ElevenLabs ConvAI for bidirectional voice. The engine is deterministic TypeScript -- code drives sound design, LLM narrates the story. Featured: "The Call" -- guide a stranger out of an underground facility before the line goes dead.

**[432 characters]**

---

## Medium (1500 chars max)

**The Problem:**
Games are visual-first and exclude imagination. Interactive fiction is stuck in text boxes. Voice AI serves assistants, never entertainment. There is no product combining AI narration + real-time voice interaction + cinematic sound design for immersive storytelling.

**The Solution:**
InnerPlay breaks the "text box" paradigm completely. You put on headphones, close your eyes, and speak -- that's the entire interface. Featured story: "The Call." Your phone rings. You answer. A stranger named Alex is trapped underground -- concrete room, no exit they can see, rising water somewhere below. You are the only one they reached. You guide them out by voice alone.

Wrong choices kill Alex. The phone goes quiet. Then it rings again. Alex accumulates memory across deaths -- by the third loop, they know they've been here before. They need you to get it right this time. Three revelation variants emerge based on how you guide: controller, recording, or many-calls. One final choice. Then the line simply goes quiet.

**Technical Stack:**
- **Mistral Large**: Real-time in-character narration, streamed token-by-token to ElevenLabs TTS
- **ElevenLabs ConvAI**: WebRTC voice I/O -- STT, VAD, turn-taking, calls Mistral directly (no custom webhook)
- **Web Audio API**: All sounds synthesized in-browser via OfflineAudioContext -- no audio files, no CDN
- **Sound Design**: Deterministic timeline (authored events at specific timestamps) + keyword regex on AI narration text -- no [SOUND:x] markers needed
- **Architecture**: Client-side state only (React useReducer). One server route: /api/signed-url.

**Key Differentiator:**
Code decides sound design and pacing (deterministic timeline, keyword detection, TTS ducking). Mistral's only job is to be the character -- fully in-world, never breaking. The system prompt does the work of a full game script.

**Live Demo:** https://mistral-lac.vercel.app

**[1,489 characters]**
