// Small DOM toolkit: element builder, forgiving tap handling, praise, sheets, toasts.
import { icon, art, burstArt, circ } from './art.js';
import { t, praiseKey } from './i18n.js';
import { say, sayText } from './speech.js';
import { sound } from './sound.js';
import { petals } from './motion.js';

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const [sk, sv] of Object.entries(v)) {
          if (sk.startsWith('--')) el.style.setProperty(sk, sv);
          else el.style[sk] = sv;
        }
      }
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'onTap') tap(el, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function svgEl(markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  return tpl.content.firstElementChild;
}

/* Taps that forgive shaky or repeated presses: one action per 450 ms. */
export function tap(el, fn, { debounce = 450 } = {}) {
  let last = 0;
  el.addEventListener('click', (e) => {
    const now = performance.now();
    if (now - last < debounce) return;
    last = now;
    fn(e);
  });
  el.addEventListener('pointerdown', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', `${e.clientX - r.left}px`);
    el.style.setProperty('--py', `${e.clientY - r.top}px`);
    el.classList.add('pressed');
  });
  const release = () => el.classList.remove('pressed');
  el.addEventListener('pointerup', release);
  el.addEventListener('pointerleave', release);
  el.addEventListener('pointercancel', release);
  return el;
}

export function button({ label, iconName, kind = 'secondary', size = '', onTap, attrs = {}, cls = '' }) {
  const b = h('button', { type: 'button', class: `btn btn-${kind}${size ? ` btn-${size}` : ''}${cls ? ` ${cls}` : ''}`, ...attrs });
  if (iconName) b.insertAdjacentHTML('beforeend', icon(iconName));
  if (label) b.append(h('span', { class: 'btn-label' }, label));
  if (!label && !attrs['aria-label']) b.setAttribute('aria-label', iconName || '');
  if (onTap) tap(b, onTap);
  return b;
}

export function iconButton({ iconName, label, kind = 'secondary', size = '', onTap, cls = '' }) {
  return button({ iconName, kind, size, onTap, cls: `btn-round ${cls}`, attrs: { 'aria-label': label, title: label } });
}

/* Big picture tile that says its name out loud when touched. */
export function tile({ artName, label, labelKey, sub, tone = 'paper', onTap, index = 0, speak = true }) {
  const text = label || t(labelKey);
  const el = h('button', { type: 'button', class: `tile tone-${tone}`, style: `--i:${index}` });
  el.append(
    h('span', { class: 'tile-art', html: art(artName) }),
    h('span', { class: 'tile-label' }, text),
  );
  if (sub) el.append(h('span', { class: 'tile-sub' }, sub));
  tap(el, (e) => {
    sound.tap();
    if (speak && labelKey) say(labelKey);
    else if (speak) sayText(text);
    onTap && onTap(e);
  });
  return el;
}

/* A spoken instruction line; touching it says it again. */
export function instruction(key, vars) {
  const el = h('button', { type: 'button', class: 'instruction' });
  el.innerHTML = `<span class="instruction-icon">${icon('speaker')}</span>`;
  el.append(h('span', { class: 'instruction-text' }, t(key, vars)));
  tap(el, () => say(key, vars));
  el.update = (k, v) => {
    key = k;
    vars = v;
    el.querySelector('.instruction-text').textContent = t(k, v);
  };
  return el;
}

/* ---------- Praise ---------- */
let praiseCard = null;
export function celebrate({ key, vars, text, sub, duration = 2300, burst = 70, speak = true, placement = 'center' } = {}) {
  const overlay = document.getElementById('overlay');
  overlay.dataset.placement = placement;
  if (praiseCard) praiseCard.remove();
  const phraseKey = key || (text ? null : praiseKey());
  const message = text || t(phraseKey, vars);
  const card = h('div', { class: 'celebrate', role: 'status' },
    h('div', { class: 'celebrate-art', html: burstArt() }),
    h('div', { class: 'celebrate-text' }, message),
    sub ? h('div', { class: 'celebrate-sub' }, sub) : null);
  praiseCard = card;
  overlay.append(card);
  sound.success();
  petals(burst);
  if (speak) {
    if (phraseKey) say(phraseKey, vars);
    else sayText(message);
  }
  return new Promise((resolve) => {
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      card.classList.add('out');
      setTimeout(() => {
        card.remove();
        if (praiseCard === card) praiseCard = null;
        resolve();
      }, 330);
    };
    const timer = setTimeout(close, duration);
    card.addEventListener('click', () => { clearTimeout(timer); close(); }, { once: true });
  });
}

/* ---------- Toast ---------- */
let toastTimer = null;
export function toast(message, ms = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ---------- Sheets & confirm ---------- */
export function sheet({ title, body, actions = [], dismissable = true, onClose } = {}) {
  const backdrop = h('div', { class: 'sheet-backdrop' });
  const panel = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title || '' });
  if (title) panel.append(h('h2', null, title));
  if (body) panel.append(body);
  if (actions.length) panel.append(h('div', { class: 'sheet-actions' }, actions));
  backdrop.append(panel);
  document.body.append(backdrop);
  let open = true;
  const onKey = (e) => { if (e.key === 'Escape' && dismissable) close(); };
  function close() {
    if (!open) return;
    open = false;
    document.removeEventListener('keydown', onKey);
    backdrop.classList.add('closing');
    setTimeout(() => backdrop.remove(), 260);
    if (onClose) onClose();
  }
  document.addEventListener('keydown', onKey);
  if (dismissable) backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  requestAnimationFrame(() => {
    const first = panel.querySelector('button, input, select, textarea');
    if (first) first.focus({ preventScroll: true });
  });
  return { close, panel };
}

export function confirmSheet({ title, message, okLabel, cancelLabel, danger = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const done = (value) => {
      if (answered) return;
      answered = true;
      s.close();
      resolve(value);
    };
    const s = sheet({
      title,
      body: message ? h('p', { class: 'sheet-message' }, message) : null,
      actions: [
        button({ label: cancelLabel || t('common.cancel'), kind: 'secondary', onTap: () => done(false) }),
        button({ label: okLabel || t('common.yes'), kind: danger ? 'danger' : 'primary', onTap: () => done(true) }),
      ],
      onClose: () => { if (!answered) { answered = true; resolve(false); } },
    });
  });
}

/* ---------- Hold-to-open (keeps the family settings away from accidental taps) ---------- */
export function holdButton({ label, hint, ms = 2000, onDone, iconName = 'settings' }) {
  const el = h('button', { type: 'button', class: 'hold', 'aria-label': `${label}. ${hint}` });
  el.innerHTML = `<span class="hold-ring"><svg viewBox="0 0 48 48" aria-hidden="true">`
    + `<path class="track" d="${circ(24, 24, 21)}" fill="none" stroke-width="3.5"/>`
    + `<path class="fill" d="M24,3 a21,21 0 1,1 0,42 a21,21 0 1,1 0,-42" pathLength="1" fill="none" stroke-width="4.5" stroke-linecap="round" style="transform:none"/>`
    + `</svg><span class="hold-icon">${icon(iconName)}</span></span>`
    + `<span class="hold-label"></span><span class="hold-tip"></span>`;
  el.querySelector('.hold-label').textContent = label;
  el.querySelector('.hold-tip').textContent = hint;
  const ring = el.querySelector('.fill');
  let started = 0;
  let raf = 0;
  let active = false;
  let tipTimer = 0;

  const reset = () => {
    active = false;
    cancelAnimationFrame(raf);
    ring.style.strokeDashoffset = '1';
    el.classList.remove('holding');
  };
  const tick = () => {
    const p = Math.min(1, (performance.now() - started) / ms);
    ring.style.strokeDashoffset = String(1 - p);
    if (p >= 1) {
      reset();
      sound.select();
      onDone();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  const begin = () => {
    if (active) return;
    active = true;
    started = performance.now();
    el.classList.add('holding');
    el.classList.remove('show-tip');
    raf = requestAnimationFrame(tick);
  };
  const end = () => {
    if (!active) return;
    const held = performance.now() - started;
    reset();
    if (held < ms) {
      el.classList.add('show-tip');
      clearTimeout(tipTimer);
      tipTimer = setTimeout(() => el.classList.remove('show-tip'), 2400);
    }
  };
  el.addEventListener('pointerdown', (e) => {
    if (el.setPointerCapture) {
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    begin();
  });
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('lostpointercapture', end);
  el.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault();
      begin();
    }
  });
  el.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') end(); });
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  return el;
}

/* ---------- Misc ---------- */
export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function emptyState({ artName, title, text, action }) {
  return h('div', { class: 'empty stagger' },
    h('div', { class: 'empty-art', style: '--i:0', html: art(artName) }),
    h('h2', { class: 'empty-title', style: '--i:1' }, title),
    text ? h('p', { class: 'empty-text', style: '--i:2' }, text) : null,
    action ? h('div', { class: 'empty-action', style: '--i:3' }, action) : null);
}
