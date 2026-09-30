// Soft bubbles float up; touching one pops it with a gentle note.
import { praiseKey } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { h } from '../core/ui.js';
import { sound } from '../core/sound.js';
import { isCalm } from '../core/motion.js';

const COLORS = [
  [217, 119, 87], [106, 155, 204], [120, 140, 93], [156, 140, 196], [227, 180, 72], [226, 142, 152],
];

export default {
  title: 'bubbles.title',
  back: '/games',
  tone: 'lilac',
  screenClass: 'bubbles-screen',
  mount(root, _params, ctx) {
    const canvas = h('canvas', { class: 'bubbles-canvas', 'aria-label': 'bubbles' });
    const wrap = h('div', { class: 'bubbles-stage' }, canvas);
    root.append(wrap);
    const g = canvas.getContext('2d');
    let w = 0;
    let hgt = 0;
    let dpr = 1;
    const calm = isCalm();

    function resize() {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      hgt = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(hgt * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${hgt}px`;
    }
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const bubbles = [];
    const bursts = [];
    let pops = 0;
    let lastSpawn = 0;
    let running = true;
    let last = performance.now();

    function spawn(now) {
      const base = Math.min(w, hgt);
      const r = base * (0.07 + Math.random() * 0.06);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      bubbles.push({
        x: r + Math.random() * (w - 2 * r),
        y: hgt + r + 10,
        r,
        vy: (calm ? 26 : 38) + Math.random() * (calm ? 14 : 30),
        phase: Math.random() * Math.PI * 2,
        wobble: 10 + Math.random() * 18,
        color,
        born: now,
        note: Math.floor(Math.random() * 8),
      });
    }

    function drawBubble(b, now) {
      const x = b.x + Math.sin(now / 900 + b.phase) * b.wobble;
      b.drawX = x;
      const [r, gg, bb] = b.color;
      const grad = g.createRadialGradient(x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.1, x, b.y, b.r);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.35, `rgba(${r},${gg},${bb},0.18)`);
      grad.addColorStop(1, `rgba(${r},${gg},${bb},0.42)`);
      g.beginPath();
      g.arc(x, b.y, b.r, 0, Math.PI * 2);
      g.fillStyle = grad;
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = `rgba(${r},${gg},${bb},0.85)`;
      g.stroke();
      g.beginPath();
      g.arc(x, b.y, b.r * 0.7, Math.PI * 1.1, Math.PI * 1.45);
      g.lineWidth = Math.max(3, b.r * 0.1);
      g.lineCap = 'round';
      g.strokeStyle = 'rgba(255,255,255,0.9)';
      g.stroke();
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const max = calm ? 5 : 8;
      if (now - lastSpawn > (calm ? 1500 : 900) && bubbles.length < max) {
        spawn(now);
        lastSpawn = now;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, hgt);
      for (let i = bubbles.length - 1; i >= 0; i -= 1) {
        const b = bubbles[i];
        b.y -= b.vy * dt;
        if (b.y < -b.r - 20) bubbles.splice(i, 1);
        else drawBubble(b, now);
      }
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const p = bursts[i];
        const age = (now - p.born) / 600;
        if (age >= 1) { bursts.splice(i, 1); continue; }
        const [r, gg, bb] = p.color;
        g.beginPath();
        g.arc(p.x, p.y, p.r * (1 + age * 0.6), 0, Math.PI * 2);
        g.lineWidth = 4 * (1 - age);
        g.strokeStyle = `rgba(${r},${gg},${bb},${0.8 * (1 - age)})`;
        g.stroke();
        for (let k = 0; k < 8; k += 1) {
          const a = (k / 8) * Math.PI * 2 + p.spin;
          const d = p.r * (0.7 + age * 0.9);
          g.beginPath();
          g.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, Math.max(1, 5 * (1 - age)), 0, Math.PI * 2);
          g.fillStyle = `rgba(${r},${gg},${bb},${1 - age})`;
          g.fill();
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let hit = -1;
      let best = Infinity;
      bubbles.forEach((b, i) => {
        const d = Math.hypot(x - (b.drawX ?? b.x), y - b.y);
        if (d < b.r + 22 && d < best) { best = d; hit = i; }
      });
      if (hit < 0) return;
      const b = bubbles.splice(hit, 1)[0];
      bursts.push({ x: b.drawX ?? b.x, y: b.y, r: b.r, color: b.color, born: performance.now(), spin: Math.random() });
      sound.pop(b.note);
      if (navigator.vibrate) navigator.vibrate(12);
      pops += 1;
      if (pops % 12 === 0) say(praiseKey());
    });

    const onVisibility = () => {
      if (document.hidden) running = false;
      else if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    };
    document.addEventListener('visibilitychange', onVisibility);
    ctx.setRepeat(() => say('bubbles.intro'));
    say('bubbles.intro');

    return () => {
      running = false;
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  },
};
