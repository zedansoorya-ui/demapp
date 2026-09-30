// Gentle sounds made on the fly with Web Audio (no files to download).
// Nothing here ever sounds like an error buzzer: "try again" is a soft two-note hum.
import { settings } from './store.js';

let ctx = null;
let master = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = settings.get().volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

settings.subscribe((s) => {
  if (master) master.gain.setTargetAtTime(s.volume, ctx.currentTime, 0.05);
});

export function unlockAudio() {
  audio();
}

function envTone({ freq, type = 'sine', at = 0, attack = 0.008, hold = 0.02, release = 0.6, gain = 0.15, glideTo = null, dest = null }) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + attack + hold + release * 0.7);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.setValueAtTime(gain, t0 + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
  osc.connect(g).connect(dest || master);
  osc.start(t0);
  osc.stop(t0 + attack + hold + release + 0.05);
}

function bell(freq, at = 0, gain = 0.12, release = 1.2) {
  envTone({ freq, at, gain, release });
  envTone({ freq: freq * 2.0, at, gain: gain * 0.3, release: release * 0.55 });
  envTone({ freq: freq * 3.01, at, gain: gain * 0.1, release: release * 0.3 });
}

let noiseBuffer = null;
function noise() {
  const c = audio();
  if (!c) return null;
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      // Brown-ish noise: softer than white noise.
      const white = Math.random() * 2 - 1;
      last = (last + 0.04 * white) / 1.04;
      data[i] = last * 3.2;
    }
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  return src;
}

function noiseBurst({ at = 0, dur = 0.05, freq = 2000, q = 2, gain = 0.3, type = 'bandpass' }) {
  const c = audio();
  const src = noise();
  if (!c || !src) return;
  const t0 = c.currentTime + at;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t0, Math.random());
  src.stop(t0 + dur + 0.05);
}

// C major pentatonic: every combination sounds pleasant.
const PENTA = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

export const sound = {
  tap() { bell(987.77, 0, 0.035, 0.35); },
  select() { bell(783.99, 0, 0.06, 0.5); },
  chime() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(f, i * 0.12, 0.11, 1.4));
  },
  success() {
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => bell(f, i * 0.09, 0.1, 1.6));
    envTone({ freq: 2093, at: 0.45, gain: 0.02, release: 1.2 });
  },
  soft() {
    bell(392.0, 0, 0.06, 0.6);
    bell(329.63, 0.18, 0.05, 0.8);
  },
  pop(i = 0) {
    const f = PENTA[((i % PENTA.length) + PENTA.length) % PENTA.length];
    envTone({ freq: f, type: 'triangle', gain: 0.14, attack: 0.004, hold: 0.01, release: 0.45 });
    envTone({ freq: f * 2, type: 'sine', gain: 0.04, attack: 0.004, hold: 0, release: 0.25 });
    noiseBurst({ dur: 0.03, freq: 3000, q: 0.8, gain: 0.12, type: 'highpass' });
  },
  note(i = 0) {
    const f = PENTA[((i % PENTA.length) + PENTA.length) % PENTA.length];
    bell(f, 0, 0.08, 1.0);
  },
  bead() {
    noiseBurst({ dur: 0.045, freq: 2400, q: 4, gain: 0.35 });
    envTone({ freq: 320, type: 'sine', gain: 0.08, attack: 0.002, hold: 0, release: 0.08 });
  },
  flip() {
    noiseBurst({ dur: 0.12, freq: 1800, q: 0.7, gain: 0.12 });
  },
  swap() {
    bell(659.25, 0, 0.05, 0.4);
    bell(880, 0.07, 0.04, 0.4);
  },
  bloom(level = 0) {
    const base = 523.25 * Math.pow(2, Math.min(level, 12) / 12);
    envTone({ freq: base, glideTo: base * 1.5, gain: 0.05, attack: 0.02, hold: 0.05, release: 0.6 });
  },
  whoosh(dur = 4, rising = true) {
    const c = audio();
    const src = noise();
    if (!c || !src) return;
    const t0 = c.currentTime;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.6;
    filter.frequency.setValueAtTime(rising ? 280 : 900, t0);
    filter.frequency.linearRampToValueAtTime(rising ? 900 : 260, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.09, t0 + dur * 0.45);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    src.loop = true;
    src.connect(filter).connect(g).connect(master);
    src.start(t0, Math.random());
    src.stop(t0 + dur + 0.1);
  },
};
