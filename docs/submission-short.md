# InnerPlay -- Submission Text Variants

## Ultra-Short (500 chars max)

**InnerPlay** is a voice-only immersive horror game where you close your eyes, speak, and play. Zero UI. Pure imagination. Powered by Mistral Large for dynamic in-character narration with sound markers, Mistral Small for real-time intent classification, and ElevenLabs ConvAI for bidirectional voice. The game engine is deterministic TypeScript—code decides game logic, LLM narrates. 14K+ lines of YAML story content. 3 stories, 17 endings, complete style tracking.

**[443 characters]**

---

## Medium (1500 chars max)

**The Problem:**
Games are visual-first and exclude imagination. Interactive fiction is stuck in text. Voice AI serves assistants, never entertainment. There's no product combining AI narration + voice interaction + cinematic sound design for immersive storytelling.

**The Solution:**
InnerPlay breaks the "text box" paradigm completely. You put on headphones, close your eyes, and speak—that's the entire interface. Play a 10-minute psychological horror game ("The Last Session") where you're a therapist meeting your final patient, Elara. She knows things she shouldn't. The building goes silent. She turns the questions on you. Your therapy style—empathetic, analytical, nurturing, confrontational—determines one of 4 revelation variants. 3 choice points. 17 endings. No screens. Pure voice.

**Technical Stack:**
- **Mistral Large**: Real-time narration with inline [SOUND:x] markers, 300-token conversational pacing, streamed token-by-token to ElevenLabs for sub-second TTFV
- **Mistral Small**: Async intent classification (11 categories + emotional register) feeding the player style tracker
- **ElevenLabs ConvAI**: WebRTC voice I/O with automatic VAD and turn-taking
- **Web Audio API**: Spatial sound, 3D ambient layers, dynamic ducking, subtractive horror design
- **Story Engine**: 31 YAML files (14K+ lines), pure TypeScript state machine and rules engine

**Key Differentiator:**
Code decides game logic (state machine, rules, endings). The LLM only narrates—no hallucinated game states. Stories are data files, not code. The engine is provider-agnostic: swap adapters and the same story runs on any LLM.

**Live Demo:** https://mistral-lac.vercel.app

**[1,298 characters]**
