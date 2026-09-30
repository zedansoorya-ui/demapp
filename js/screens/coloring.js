// Tap a colour, tap the picture. Paint spreads from the finger like a ripple.
import { t } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { db } from '../core/store.js';
import { h, button, celebrate, tap } from '../core/ui.js';
import { navigate } from '../core/router.js';
import { sound } from '../core/sound.js';
import { isCalm, sparkleAt } from '../core/motion.js';
import { PALETTE, pageById } from '../data/pages.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  return el;
};

export default {
  title: (params) => {
    const page = pageById(params.page);
    return page ? t(page.nameKey) : t('coloring.title');
  },
  back: '/coloring',
  tone: 'clay',
  screenClass: 'coloring-screen',
  async mount(root, params, ctx) {
    const page = pageById(params.page);
    if (!page) {
      navigate('/coloring', { replace: true });
      return;
    }
    const saved = await db.get('art', page.id);
    if (!ctx.isCurrent()) return;
    const fills = { ...(saved && saved.fills) };
    let done = !!(saved && saved.done);
    const history = [];
    let color = PALETTE[1].hex;
    let seq = 0;

    /* ---------- Picture ---------- */
    const svg = svgEl('svg', { viewBox: '0 0 600 600', class: 'coloring-svg', role: 'img', 'aria-label': t(page.nameKey) });
    const defs = svgEl('defs');
    const fillLayer = svgEl('g', { class: 'fill-layer' });
    const fxLayer = svgEl('g', { class: 'fx-layer', 'pointer-events': 'none' });
    const lineLayer = svgEl('g', { class: 'line-layer', 'pointer-events': 'none', fill: 'none', stroke: '#141413', 'stroke-width': '6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const regionEls = new Map();
    page.regions.forEach((r) => {
      const el = svgEl('path', { d: r.d, transform: r.transform, fill: fills[r.id] || '#ffffff', 'data-id': r.id });
      regionEls.set(r.id, el);
      fillLayer.append(el);
      lineLayer.append(svgEl('path', { d: r.d, transform: r.transform }));
    });
    page.details.forEach((d) => lineLayer.append(svgEl('path', { d })));
    svg.append(defs, fillLayer, fxLayer, lineLayer);

    let saveTimer = 0;
    const persist = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        db.put('art', { id: page.id, fills: { ...fills }, done, updatedAt: Date.now() }).catch(() => {});
      }, 400);
    };

    function toSvgPoint(e) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const m = svg.getScreenCTM();
      return m ? pt.matrixTransform(m.inverse()) : { x: 300, y: 300 };
    }

    function setFill(id, value, point) {
      const el = regionEls.get(id);
      if (!el) return;
      fills[id] = value;
      if (isCalm() || !point) {
        el.setAttribute('fill', value);
        return;
      }
      const clipId = `ripple-${page.id}-${++seq}`;
      const clip = svgEl('clipPath', { id: clipId });
      const shape = el.cloneNode(false);
      shape.removeAttribute('fill');
      shape.removeAttribute('data-id');
      clip.append(shape);
      defs.append(clip);
      const circle = svgEl('circle', { cx: point.x, cy: point.y, r: 0, fill: value, 'clip-path': `url(#${clipId})` });
      fxLayer.append(circle);
      const box = el.getBBox();
      const far = Math.max(
        Math.hypot(point.x - box.x, point.y - box.y),
        Math.hypot(point.x - box.x - box.width, point.y - box.y),
        Math.hypot(point.x - box.x, point.y - box.y - box.height),
        Math.hypot(point.x - box.x - box.width, point.y - box.y - box.height),
      ) + 12;
      const start = performance.now();
      const dur = 380 + Math.min(far, 600) * 0.5;
      const step = (now) => {
        const p = Math.min(1, Math.max(0, (now - start) / dur));
        circle.setAttribute('r', String(far * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
        else {
          el.setAttribute('fill', fills[id]);
          circle.remove();
          clip.remove();
        }
      };
      requestAnimationFrame(step);
    }

    svg.addEventListener('click', (e) => {
      const target = e.target.closest && e.target.closest('path[data-id]');
      if (!target) return;
      const id = target.getAttribute('data-id');
      const prev = fills[id] || '#ffffff';
      if (prev.toLowerCase() === color.toLowerCase()) {
        sparkleAt(e.clientX, e.clientY, [color], 8);
        return;
      }
      history.push([[id, prev]]);
      sound.pop(PALETTE.findIndex((p) => p.hex === color) + 2);
      setFill(id, color, toSvgPoint(e));
      persist();
    });

    /* ---------- Palette ---------- */
    const palette = h('div', { class: 'palette', role: 'radiogroup', 'aria-label': t('coloring.intro') });
    PALETTE.forEach((p, i) => {
      const sw = h('button', {
        type: 'button',
        class: `swatch${p.key === 'white' ? ' white' : ''}`,
        role: 'radio',
        style: { '--c': p.hex },
        'aria-checked': String(p.hex === color),
        'aria-label': t(`color.${p.key}`),
        title: t(`color.${p.key}`),
      });
      tap(sw, () => {
        color = p.hex;
        palette.querySelectorAll('.swatch').forEach((el) => el.setAttribute('aria-checked', String(el === sw)));
        sound.note(i);
        say(`color.${p.key}`);
      }, { debounce: 150 });
      palette.append(sw);
    });

    /* ---------- Tools ---------- */
    const undo = button({
      label: t('coloring.undo'),
      iconName: 'undo',
      kind: 'secondary',
      size: 'small',
      onTap: () => {
        const last = history.pop();
        if (!last) return;
        sound.tap();
        last.forEach(([id, prev]) => setFill(id, prev, null));
        persist();
      },
    });
    const fresh = button({
      label: t('coloring.clear'),
      iconName: 'refresh',
      kind: 'secondary',
      size: 'small',
      onTap: () => {
        const batch = page.regions.map((r) => [r.id, fills[r.id] || '#ffffff']).filter(([, prev]) => prev !== '#ffffff');
        if (!batch.length) return;
        history.push(batch);
        sound.flip();
        page.regions.forEach((r) => setFill(r.id, '#ffffff', null));
        done = false;
        persist();
      },
    });
    const finish = button({
      label: t('coloring.done'),
      iconName: 'check',
      kind: 'clay',
      size: 'small',
      onTap: () => {
        done = true;
        persist();
        celebrate({ key: 'coloring.finished', duration: 2600 });
      },
    });

    root.append(h('div', { class: 'coloring' },
      h('div', { class: 'coloring-canvas' }, svg),
      h('div', { class: 'coloring-side' },
        h('p', { class: 'coloring-hint' }, t('coloring.intro')),
        palette,
        h('div', { class: 'coloring-tools' }, undo, fresh, finish))));

    ctx.setRepeat(() => say('coloring.intro'));
    say('coloring.intro');

    return () => {
      clearTimeout(saveTimer);
      db.put('art', { id: page.id, fills: { ...fills }, done, updatedAt: Date.now() }).catch(() => {});
    };
  },
};
