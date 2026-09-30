// Photos, voice recordings, audio playback and keeping the screen awake.

/* ---------- Object URLs ---------- */
const urlCache = new WeakMap();
export function blobURL(blob) {
  if (!blob) return '';
  let url = urlCache.get(blob);
  if (!url) {
    url = URL.createObjectURL(blob);
    urlCache.set(blob, url);
  }
  return url;
}

/* ---------- Photos ---------- */
function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this picture')); };
    img.src = url;
  });
}

/* Shrinks a photo so a whole family fits comfortably in browser storage. */
export async function resizeImage(file, max = 1400, quality = 0.86) {
  let source;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    source = await loadImageElement(file);
  }
  const w = source.width;
  const h = source.height;
  if (!w || !h) throw new Error('Empty picture');
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if (source.close) source.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Could not save picture');
  return blob;
}

/* Renders an SVG string to a PNG blob (used for built-in puzzle pictures). */
export async function svgToBlob(svg, size = 900) {
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.getContext('2d').drawImage(img, 0, 0, size, size);
  URL.revokeObjectURL(url);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/* ---------- Playback (one shared element so mobile browsers keep it unlocked) ---------- */
let audioEl = null;
let pending = null;

function settle() {
  const done = pending;
  pending = null;
  if (done) done();
}

export function playBlob(blob, { volume = 1 } = {}) {
  stopAudio();
  if (!blob) return Promise.resolve();
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'auto';
  }
  return new Promise((resolve) => {
    pending = resolve;
    audioEl.onended = settle;
    audioEl.onerror = settle;
    audioEl.src = blobURL(blob);
    audioEl.volume = volume;
    const started = audioEl.play();
    if (started && started.catch) started.catch(settle);
  });
}

export function stopAudio() {
  if (audioEl) {
    audioEl.pause();
    try { audioEl.currentTime = 0; } catch { /* not loaded */ }
  }
  settle();
}

/* ---------- Recording ---------- */
const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/aac'];

export function canRecord() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}

export class VoiceRecorder {
  constructor({ maxMs = 15000, onLevel = null } = {}) {
    this.maxMs = maxMs;
    this.onLevel = onLevel;
    this.chunks = [];
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    const type = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
    this.recorder = new MediaRecorder(this.stream, type ? { mimeType: type } : undefined);
    this.chunks = [];
    this.recorder.ondataavailable = (e) => { if (e.data && e.data.size) this.chunks.push(e.data); };
    this.done = new Promise((resolve) => {
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.recorder.mimeType || type || 'audio/webm' });
        this.cleanup();
        resolve(blob);
      };
    });
    this.meter();
    this.recorder.start(200);
    this.timer = setTimeout(() => this.stop(), this.maxMs);
  }

  meter() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !this.onLevel) return;
    this.ctx = new AC();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    src.connect(this.analyser);
    const buf = new Uint8Array(this.analyser.fftSize);
    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 1) {
        const x = (buf[i] - 128) / 128;
        sum += x * x;
      }
      this.onLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4));
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() {
    if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
    return this.done || Promise.resolve(null);
  }

  cleanup() {
    clearTimeout(this.timer);
    cancelAnimationFrame(this.raf);
    this.analyser = null;
    if (this.ctx && this.ctx.close) this.ctx.close().catch(() => {});
    if (this.stream) this.stream.getTracks().forEach((track) => track.stop());
  }
}

/* ---------- Backups ---------- */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataURLToBlob(url) {
  const res = await fetch(url);
  return res.blob();
}

/* ---------- Keep the screen on during songs and slideshows ---------- */
let wakeLock = null;
let wantAwake = false;

async function acquire() {
  try {
    if (wantAwake && !wakeLock && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch { /* not allowed right now */ }
}

export async function keepAwake(on) {
  wantAwake = on;
  if (on) {
    await acquire();
  } else if (wakeLock) {
    try { await wakeLock.release(); } catch { /* already released */ }
    wakeLock = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') acquire();
});
