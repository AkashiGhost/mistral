// ─────────────────────────────────────────────
// Synthetic sound generator — browser-side AudioBuffer synthesis
// Generates placeholder ambient sounds when audio files aren't available.
// Uses OfflineAudioContext for proper filtering.
// ─────────────────────────────────────────────

const SAMPLE_RATE = 44100;

/** Generate filtered noise buffer (rain, HVAC) */
async function generateFilteredNoise(
  duration: number,
  filterType: BiquadFilterType,
  frequency: number,
  Q: number,
  gain: number,
): Promise<AudioBuffer> {
  const length = SAMPLE_RATE * duration;
  const offlineCtx = new OfflineAudioContext(1, length, SAMPLE_RATE);

  // White noise source
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
  const duration = 1; // 1 second = 1 tick per loop
  const length = SAMPLE_RATE * duration;
  const offlineCtx = new OfflineAudioContext(1, length, SAMPLE_RATE);

  // Short click: 800Hz oscillator with fast envelope
  const osc = offlineCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 800;

  const env = offlineCtx.createGain();
  env.gain.setValueAtTime(0, 0);
  env.gain.linearRampToValueAtTime(0.6, 0.001); // Attack: 1ms
  env.gain.exponentialRampToValueAtTime(0.001, 0.05); // Decay: 50ms

  osc.connect(env);
  env.connect(offlineCtx.destination);
  osc.start(0);
  osc.stop(0.06);

  return offlineCtx.startRendering();
}

/** Generate a sustained drone (cello, sub-bass, low tone) */
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

  // Slight detuning for organic feel
  const osc2 = offlineCtx.createOscillator();
  osc2.type = waveform;
  osc2.frequency.value = frequency * 1.003;

  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = gain;

  // Lowpass to soften
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

export interface SynthSounds {
  rain: AudioBuffer;
  hvac: AudioBuffer;
  clock: AudioBuffer;
  cello_drone: AudioBuffer;
  sub_bass: AudioBuffer;
  low_tone: AudioBuffer;
}

/** Generate all synthetic ambient sound buffers */
export async function generateAllSynthSounds(): Promise<SynthSounds> {
  console.log("[SYNTH] Generating synthetic sound buffers...");

  const [rain, hvac, clock, cello_drone, sub_bass, low_tone] =
    await Promise.all([
      // Rain: bandpass filtered noise at 4kHz — sounds like rainfall
      generateFilteredNoise(8, "bandpass", 4000, 0.5, 0.15),
      // HVAC: lowpass filtered noise at 100Hz — low mechanical hum
      generateFilteredNoise(6, "lowpass", 100, 1.0, 0.2),
      // Clock: single tick per second
      generateClockTick(),
      // Cello drone: sawtooth at D2 (73.4Hz)
      generateDrone(73.4, "sawtooth", 8, 0.25),
      // Sub-bass: sine at 25Hz
      generateDrone(25, "sine", 6, 0.3),
      // Low tone: sine at 90Hz (revelation)
      generateDrone(90, "sine", 6, 0.35),
    ]);

  console.log("[SYNTH] All synthetic buffers generated");
  return { rain, hvac, clock, cello_drone, sub_bass, low_tone };
}
