// ─────────────────────────────────────────────
// Synthetic sound generator — browser-side AudioBuffer synthesis
// Generates placeholder ambient sounds when audio files aren't available.
// Story-aware: each story gets its own appropriate sound palette.
// ─────────────────────────────────────────────

const SAMPLE_RATE = 44100;

/** Generate filtered noise buffer (rain, wind, HVAC, etc.) */
async function generateFilteredNoise(
  duration: number,
  filterType: BiquadFilterType,
  frequency: number,
  Q: number,
  gain: number,
): Promise<AudioBuffer> {
  const length = SAMPLE_RATE * duration;
  const offlineCtx = new OfflineAudioContext(1, length, SAMPLE_RATE);

  const noiseBuffer = offlineCtx.createBuffer(1, length, SAMPLE_RATE);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = offlineCtx.createBufferSource();
  source.buffer = noiseBuffer;

  const filter = offlineCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = frequency;
  filter.Q.value = Q;

  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = gain;

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(offlineCtx.destination);
  source.start();

  return offlineCtx.startRendering();
}

/** Generate a clock tick buffer (1 second with a sharp click at the start) */
async function generateClockTick(): Promise<AudioBuffer> {
  const duration = 1;
  const length = SAMPLE_RATE * duration;
  const offlineCtx = new OfflineAudioContext(1, length, SAMPLE_RATE);

  const osc = offlineCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 800;

  const env = offlineCtx.createGain();
  env.gain.setValueAtTime(0, 0);
  env.gain.linearRampToValueAtTime(0.6, 0.001);
  env.gain.exponentialRampToValueAtTime(0.001, 0.05);

  osc.connect(env);
  env.connect(offlineCtx.destination);
  osc.start(0);
  osc.stop(0.06);

  return offlineCtx.startRendering();
}

/** Generate a sustained drone */
async function generateDrone(
  frequency: number,
  waveform: OscillatorType,
  duration: number,
  gain: number,
): Promise<AudioBuffer> {
  const length = SAMPLE_RATE * duration;
  const offlineCtx = new OfflineAudioContext(1, length, SAMPLE_RATE);

  const osc = offlineCtx.createOscillator();
  osc.type = waveform;
  osc.frequency.value = frequency;

  const osc2 = offlineCtx.createOscillator();
  osc2.type = waveform;
  osc2.frequency.value = frequency * 1.003;

  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = gain;

  const filter = offlineCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency * 3;

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(offlineCtx.destination);

  osc.start();
  osc2.start();

  return offlineCtx.startRendering();
}

// ─────────────────────────────────────────────
// Story-specific sound generation
// ─────────────────────────────────────────────

export type SoundSet = Record<string, AudioBuffer>;

/** The Last Session — therapy office: rain, HVAC hum, clock, drones */
async function generateLastSessionSounds(): Promise<SoundSet> {
  const [rain, hvac, clock, cello_drone, sub_bass, low_tone] =
    await Promise.all([
      generateFilteredNoise(8, "bandpass", 4000, 0.5, 0.15),
      generateFilteredNoise(6, "lowpass", 100, 1.0, 0.2),
      generateClockTick(),
      generateDrone(73.4, "sawtooth", 8, 0.25),
      generateDrone(25, "sine", 6, 0.3),
      generateDrone(90, "sine", 6, 0.35),
    ]);
  return { rain, hvac, clock, cello_drone, sub_bass, low_tone };
}

/** The Lighthouse — coastal storm: ocean waves, wind, creaking, foghorn drone */
async function generateLighthouseSounds(): Promise<SoundSet> {
  const [ocean, wind, creak, foghorn_drone, sub_bass] =
    await Promise.all([
      // Ocean: lowpass noise at 800Hz — deep rumbling waves
      generateFilteredNoise(8, "lowpass", 800, 0.3, 0.2),
      // Wind: bandpass noise at 2000Hz — howling gale
      generateFilteredNoise(8, "bandpass", 2000, 0.8, 0.12),
      // Creak: very narrow bandpass at 300Hz — wood groaning
      generateFilteredNoise(4, "bandpass", 300, 5.0, 0.08),
      // Foghorn: low sawtooth drone at A1 (55Hz)
      generateDrone(55, "sawtooth", 8, 0.2),
      // Sub bass: rumbling 30Hz foundation
      generateDrone(30, "sine", 6, 0.25),
    ]);
  return { ocean, wind, creak, foghorn_drone, sub_bass };
}

/** Room 4B — abandoned hospital: fluorescent hum, machinery, metallic echo, heartbeat */
async function generateRoom4bSounds(): Promise<SoundSet> {
  const [fluorescent_hum, machinery, metal_echo, heartbeat_drone, sub_bass, low_tone] =
    await Promise.all([
      // Fluorescent hum: narrow bandpass at 120Hz (mains frequency harmonic)
      generateFilteredNoise(6, "bandpass", 120, 8.0, 0.15),
      // Distant machinery: lowpass rumble at 200Hz
      generateFilteredNoise(8, "lowpass", 200, 0.5, 0.1),
      // Metal echo: sharp bandpass at 1200Hz — thin metallic resonance
      generateFilteredNoise(4, "bandpass", 1200, 6.0, 0.05),
      // Heartbeat-like drone: sine at 40Hz with slight detune
      generateDrone(40, "sine", 6, 0.2),
      // Sub bass: 20Hz rumble
      generateDrone(20, "sine", 6, 0.25),
      // Low tone: 80Hz revelation
      generateDrone(80, "sine", 6, 0.3),
    ]);
  return { fluorescent_hum, machinery, metal_echo, heartbeat_drone, sub_bass, low_tone };
}

/** Generate story-specific sound set */
export async function generateSoundsForStory(storyId: string): Promise<SoundSet> {
  console.log(`[SYNTH] Generating synthetic sounds for story: ${storyId}`);

  let sounds: SoundSet;
  switch (storyId) {
    case "the-lighthouse":
      sounds = await generateLighthouseSounds();
      break;
    case "room-4b":
      sounds = await generateRoom4bSounds();
      break;
    default:
      sounds = await generateLastSessionSounds();
      break;
  }

  console.log(`[SYNTH] Generated ${Object.keys(sounds).length} buffers for "${storyId}": [${Object.keys(sounds).join(", ")}]`);
  return sounds;
}
