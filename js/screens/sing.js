// Sing with me: the louder and longer you sing (or hum), the more the garden blooms.
// Works without a microphone too: touching and holding the garden makes it grow.
import { t } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { h, button, celebrate, instruction, toast } from '../core/ui.js';
import { C } from '../core/art.js';
import { navigate } from '../core/router.js';
import { sound } from '../core/sound.js';
import { isCalm } from '../core/motion.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const FLOWER_COLORS = ['#d64545', '#ec8a54', '#f2c14e', '#ef9ab0', '#8e72c4', '#4a7fc1', '#e28e98'];
const GROUND = 468;

export default {
  title: 'sing.title',
  back: '/games',
  tone: 'sky',
  screenClass: 'sing-screen',
  mount(root, _params, ctx) {
    const svg = el('svg', { viewBox: '0 0 1000 560', class: 'garden-svg', preserveAspectRatio: 'xMidYMax meet' });
    const glow = el('circle', { cx: 500, cy: 138, r: 120, fill: C.gold, opacity: 0.18, class: 'orb-glow' });
    const orb = el('circle', { cx: 500, cy: 138, r: 64, fill: C.gold, stroke: C.ink, 'stroke-width': 4 });
    const orbFace = el('g', { class: 'orb-rays' });
    for (let i = 0; i < 12; i += 1) {
      const a = (i * Math.PI) / 6;
      orbFace.append(el('line', {
        x1: 500 + 80 * Math.cos(a), y1: 138 + 80 * Math.sin(a), x2: 500 + 98 * Math.cos(a), y2: 138 + 98 * Math.sin(a),
        stroke: C.gold, 'stroke-width': 8, 'stroke-linecap': 'round',
      }));
    }
    // The hill runs well past the picture's edges so it always reaches the sides of the frame.
    const hills = el('path', { d: 'M-900,468C-600,440 -250,474 0,466C200,432 380,452 520,442C700,430 860,452 1000,438C1250,424 1550,462 1900,448V1200H-900Z', fill: C.sageSoft, stroke: C.ink, 'stroke-width': 4 });
    const flowersLayer = el('g');
    const notesLayer = el('g');
    svg.append(glow, orbFace, orb, flowersLayer, hills, notesLayer);

    /* ---------- Flowers ---------- */
    const xs = [110, 245, 372, 500, 628, 755, 890];
    const heights = [210, 260, 190, 290, 220, 270, 200];
    let palette = FLOWER_COLORS.slice();
    const flowers = xs.map((x, i) => {
      const g = el('g');
      const stem = el('line', { x1: x, y1: GROUND, x2: x, y2: GROUND, stroke: C.sage, 'stroke-width': 9, 'stroke-linecap': 'round' });
      const leafL = el('ellipse', { rx: 24, ry: 10, fill: '#a5c96f', stroke: C.ink, 'stroke-width': 3 });
      const leafR = el('ellipse', { rx: 24, ry: 10, fill: '#a5c96f', stroke: C.ink, 'stroke-width': 3 });
      const head = el('g');
      const petals = [];
      for (let k = 0; k < 6; k += 1) {
        const p = el('ellipse', { cx: 0, cy: -24, rx: 15, ry: 25, stroke: C.ink, 'stroke-width': 3, transform: `rotate(${k * 60})` });
        petals.push(p);
        head.append(p);
      }
      head.append(el('circle', { r: 15, fill: C.gold, stroke: C.ink, 'stroke-width': 3 }));
      g.append(stem, leafL, leafR, head);
      flowersLayer.append(g);
      return { x, maxH: heights[i], growth: 0, stem, leafL, leafR, head, petals, seed: Math.random() * 10 };
    });
    function colorFlowers() {
      flowers.forEach((f, i) => f.petals.forEach((p) => p.setAttribute('fill', palette[i % palette.length])));
    }
    colorFlowers();

    function drawFlowers(now) {
      flowers.forEach((f) => {
        const hgt = 14 + f.growth * f.maxH;
        const top = GROUND - hgt;
        f.stem.setAttribute('y2', String(top));
        const leafScale = clamp((f.growth - 0.2) / 0.25);
        const ly = GROUND - hgt * 0.38;
        f.leafL.setAttribute('transform', `translate(${f.x - 20 * leafScale} ${ly}) rotate(-28) scale(${leafScale})`);
        f.leafR.setAttribute('transform', `translate(${f.x + 20 * leafScale} ${ly - 18}) rotate(28) scale(${leafScale})`);
        const bud = f.growth < 0.3 ? 0 : 0.3 + 0.7 * clamp((f.growth - 0.45) / 0.55);
        const sway = Math.sin(now / 700 + f.seed) * (2 + f.growth * 3);
        f.head.setAttribute('transform', `translate(${f.x} ${top}) rotate(${sway}) scale(${bud})`);
      });
    }

    /* ---------- Notes that float up ---------- */
    let lastNote = 0;
    function spawnNote(energy) {
      const x = 380 + Math.random() * 240;
      const g = el('g', { class: 'note', style: `--dx:${(Math.random() - 0.5) * 260}px` });
      const color = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
      g.append(
        el('path', { d: `M${x + 9},${GROUND - 10} V${GROUND - 50} L${x + 27},${GROUND - 56} V${GROUND - 18}`, fill: 'none', stroke: C.ink, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
        el('ellipse', { cx: x, cy: GROUND - 10, rx: 10, ry: 8, fill: color, stroke: C.ink, 'stroke-width': 3 }),
        el('ellipse', { cx: x + 18, cy: GROUND - 18, rx: 10, ry: 8, fill: color, stroke: C.ink, 'stroke-width': 3 }),
      );
      g.style.setProperty('--s', String(0.7 + energy * 0.6));
      notesLayer.append(g);
      setTimeout(() => g.remove(), 2800);
    }

    /* ---------- Listening ---------- */
    let stream = null;
    let audioCtx = null;
    let analyser = null;
    let buf = null;
    let level = 0;
    let holding = false;
    let alive = true;
    let celebrating = false;
    let last = performance.now();
    const calm = isCalm();

    const status = h('p', { class: 'sing-status', hidden: true },
      h('span', { class: 'sing-dot' }), h('span', null, t('sing.listening')),
      h('span', { class: 'sing-meter' }, h('i'), h('i'), h('i'), h('i'), h('i')));
    const meterBars = status.querySelectorAll('.sing-meter i');

    async function startMic() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast(t('sing.noMic'));
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
      } catch {
        toast(t('sing.noMic'));
        say('sing.noMic');
        return;
      }
      if (!alive) { stream.getTracks().forEach((tr) => tr.stop()); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      buf = new Float32Array(analyser.fftSize);
      src.connect(analyser);
      startBtn.hidden = true;
      stopBtn.hidden = false;
      status.hidden = false;
      say('sing.listening');
    }

    function stopMic() {
      if (stream) stream.getTracks().forEach((tr) => tr.stop());
      if (audioCtx && audioCtx.close) audioCtx.close().catch(() => {});
      stream = null;
      audioCtx = null;
      analyser = null;
      startBtn.hidden = false;
      stopBtn.hidden = true;
      status.hidden = true;
    }

    function micLevel() {
      if (!analyser) return 0;
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 1) sum += buf[i] * buf[i];
      return Math.sqrt(sum / buf.length);
    }

    async function bloomed() {
      celebrating = true;
      await celebrate({ key: 'sing.bloom', duration: 2800 });
      if (!alive) return;
      const start = performance.now();
      const from = flowers.map((f) => f.growth);
      const fade = (now) => {
        const p = clamp((now - start) / 1400);
        flowers.forEach((f, i) => { f.growth = from[i] * (1 - p); });
        if (p < 1 && alive) requestAnimationFrame(fade);
        else {
          palette = palette.slice(1).concat(palette[0]);
          colorFlowers();
          celebrating = false;
        }
      };
      requestAnimationFrame(fade);
    }

    let chimeLevel = 0;
    function frame(now) {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const raw = micLevel();
      level = level * 0.8 + raw * 0.2;
      let energy = analyser ? clamp((level - 0.012) / 0.1) : 0;
      if (holding) energy = Math.max(energy, 0.6);
      if (!celebrating && energy > 0.05) {
        const next = flowers.find((f) => f.growth < 1);
        if (next) {
          const before = next.growth;
          next.growth = clamp(next.growth + energy * dt * 0.55);
          if (before < 0.5 && next.growth >= 0.5) sound.bloom(chimeLevel++ % 8);
        }
        flowers.forEach((f) => { f.growth = clamp(f.growth + energy * dt * 0.03); });
        if (flowers.every((f) => f.growth >= 1)) bloomed();
      }
      const interval = calm ? 700 : 260 / Math.max(energy, 0.15);
      if (energy > 0.2 && now - lastNote > interval) {
        lastNote = now;
        spawnNote(energy);
      }
      const s = 1 + energy * 0.3;
      orb.setAttribute('r', String(64 * s));
      glow.setAttribute('r', String(110 + energy * 70));
      glow.setAttribute('opacity', String(0.16 + energy * 0.4));
      orbFace.setAttribute('transform', `rotate(${(now / 80) % 360} 500 138)`);
      meterBars.forEach((bar, i) => bar.classList.toggle('on', energy > (i + 0.5) / 5));
      drawFlowers(now);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    const stage = h('div', { class: 'garden' });
    stage.append(svg);
    stage.addEventListener('pointerdown', (e) => {
      holding = true;
      if (stage.setPointerCapture) {
        try { stage.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      }
    });
    const release = () => { holding = false; };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('lostpointercapture', release);

    const startBtn = button({ label: t('sing.start'), iconName: 'mic', kind: 'clay', onTap: startMic });
    const stopBtn = button({ label: t('common.stop'), iconName: 'stop', kind: 'secondary', onTap: stopMic });
    stopBtn.hidden = true;
    const wordsBtn = button({ label: t('sing.songs'), iconName: 'lyrics', kind: 'secondary', onTap: () => navigate('/music/words') });

    const hasMic = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    if (!hasMic) startBtn.hidden = true;

    root.append(
      instruction(hasMic ? 'sing.intro' : 'sing.touch'),
      stage,
      h('div', { class: 'sing-controls' }, status, startBtn, stopBtn, wordsBtn),
    );
    ctx.setRepeat(() => say(hasMic ? 'sing.intro' : 'sing.touch'));
    say(hasMic ? 'sing.intro' : 'sing.touch');

    return () => {
      alive = false;
      stopMic();
    };
  },
};
