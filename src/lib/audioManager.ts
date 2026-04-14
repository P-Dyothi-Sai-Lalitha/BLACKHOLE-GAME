/**
 * Audio Manager — procedural audio using Web Audio API.
 * No external audio files needed. All sounds are synthesized.
 */

let audioCtx: AudioContext | null = null;
let isMuted = true; // Default: muted
let masterGain: GainNode | null = null;
let musicOscillators: OscillatorNode[] = [];
let musicGains: GainNode[] = [];
let musicPlaying = false;

export function isMusicPlaying(): boolean {
  return musicPlaying;
}

const MASTER_VOLUME = 0.25; // 25%
const MUSIC_VOLUME = 0.06; // Very subtle background

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = isMuted ? 0 : MASTER_VOLUME;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

// ─── Public API ───

export function setMuted(muted: boolean) {
  isMuted = muted;
  if (masterGain) {
    masterGain.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, audioCtx!.currentTime, 0.1);
  }
}

export function getMuted(): boolean {
  return isMuted;
}

export function toggleMute(): boolean {
  setMuted(!isMuted);
  return isMuted;
}

// ─── Sound Effects ───

/** Short click sound */
export function playClick() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(getMaster());
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/** Tile placement sound — a satisfying "thud" with reverb feel */
export function playPlace() {
  const ctx = getCtx();
  // Low thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(getMaster());
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.25);

  // High shimmer
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(1200, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
  gain2.gain.setValueAtTime(0.15, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc2.connect(gain2);
  gain2.connect(getMaster());
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 0.2);
}

/** Game start — ascending arpeggio */
export function playGameStart() {
  const ctx = getCtx();
  const notes = [330, 440, 550, 660];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(getMaster());
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Game end — descending chord */
export function playGameEnd() {
  const ctx = getCtx();
  const notes = [660, 550, 440, 330];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(getMaster());
    osc.start(t);
    osc.stop(t + 0.55);
  });
}

// ─── Background Music (procedural ambient drone) ───

export function startMusic() {
  if (musicPlaying) return;
  const ctx = getCtx();
  musicPlaying = true;

  // Create a subtle ambient drone with slow-moving harmonics
  const fundamentals = [55, 82.5, 110]; // A1, E2, A2 — space-y chord
  fundamentals.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = MUSIC_VOLUME;
    osc.connect(gain);
    gain.connect(getMaster());
    osc.start();
    musicOscillators.push(osc);
    musicGains.push(gain);
  });

  // Add a slow LFO-modulated pad
  const padOsc = ctx.createOscillator();
  const padGain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  padOsc.type = "triangle";
  padOsc.frequency.value = 165; // E3
  lfo.type = "sine";
  lfo.frequency.value = 0.15; // Very slow modulation
  lfoGain.gain.value = 8; // Subtle frequency wobble
  lfo.connect(lfoGain);
  lfoGain.connect(padOsc.frequency);
  padGain.gain.value = MUSIC_VOLUME * 0.5;
  padOsc.connect(padGain);
  padGain.connect(getMaster());
  padOsc.start();
  lfo.start();
  musicOscillators.push(padOsc, lfo);
  musicGains.push(padGain);
}

export function stopMusic() {
  musicOscillators.forEach((osc) => {
    try { osc.stop(); } catch (_) { /* already stopped */ }
  });
  musicOscillators = [];
  musicGains = [];
  musicPlaying = false;
}
