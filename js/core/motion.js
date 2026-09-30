// Celebration petals and little sparkles, drawn on one full-screen canvas.
import { settings } from './store.js';
import { C } from './art.js';

const reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export function isCalm() {
  return settings.get().calm || !!(reduceQuery && reduceQuery.matches);
}

let canvas = null;
let ctx = null;
let particles = [];
let running = false;
let dpr = 1;

function setup() {
  if (canvas) return;
  canvas = document.getElementById('fx');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}

const PALETTE = [C.clay, C.sky, C.sage, C.gold, C.rose, C.lilac, C.kraft];

function loop() {
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const now = performance.now();
  particles = particles.filter((p) => now - p.born < p.life);
  for (const p of particles) {
    const age = (now - p.born) / p.life;
    const dt = 1 / 60;
    p.vy += p.gravity * dt;
    p.vx *= 0.992;
    p.vy *= 0.992;
    p.x += p.vx * dt + Math.sin(now / 420 + p.seed) * p.sway;
    p.y += p.vy * dt;
    p.rot += p.spin * dt;
    const alpha = age < 0.1 ? age / 0.1 : 1 - Math.max(0, (age - 0.6) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.kind === 'petal') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'dot') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.15, -s * 0.15, s, 0);
      ctx.quadraticCurveTo(s * 0.15, s * 0.15, 0, s);
      ctx.quadraticCurveTo(-s * 0.15, s * 0.15, -s, 0);
      ctx.quadraticCurveTo(-s * 0.15, -s * 0.15, 0, -s);
      ctx.fill();
    }
    ctx.restore();
  }
  if (particles.length) {
    requestAnimationFrame(loop);
  } else {
    running = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function start() {
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
}

/* Soft petals drifting down from the top and out from the middle. */
export function petals(count = 70) {
  setup();
  if (!ctx) return;
  const calm = isCalm();
  const n = calm ? Math.round(count / 4) : count;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const now = performance.now();
  for (let i = 0; i < n; i += 1) {
    const fromCenter = i % 3 === 0 && !calm;
    const angle = Math.random() * Math.PI * 2;
    const speed = 180 + Math.random() * 260;
    particles.push({
      kind: Math.random() < 0.55 ? 'petal' : (Math.random() < 0.5 ? 'dot' : 'spark'),
      x: fromCenter ? w / 2 : Math.random() * w,
      y: fromCenter ? h / 2 : -20 - Math.random() * h * 0.3,
      vx: fromCenter ? Math.cos(angle) * speed : (Math.random() - 0.5) * 40,
      vy: fromCenter ? Math.sin(angle) * speed - 120 : 60 + Math.random() * 80,
      gravity: fromCenter ? 260 : 30,
      sway: calm ? 0.2 : 0.6 + Math.random() * 0.8,
      size: 6 + Math.random() * 9,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 4,
      color: PALETTE[i % PALETTE.length],
      seed: Math.random() * 100,
      born: now + (fromCenter ? 0 : Math.random() * 400),
      life: 2600 + Math.random() * 1400,
    });
  }
  start();
}

/* A small burst where a finger touched. */
export function sparkleAt(x, y, colors = PALETTE, count = 14) {
  setup();
  if (!ctx) return;
  const n = isCalm() ? Math.round(count / 3) : count;
  const now = performance.now();
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 120 + Math.random() * 160;
    particles.push({
      kind: i % 2 ? 'dot' : 'spark',
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      gravity: 120,
      sway: 0,
      size: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 6,
      color: colors[i % colors.length],
      seed: Math.random() * 100,
      born: now,
      life: 700 + Math.random() * 500,
    });
  }
  start();
}

export function clearEffects() {
  particles = [];
}
