// Hash router with gentle screen transitions. Hash URLs work on any static host.
import { t } from './i18n.js';
import { say, stop as stopSpeech, onSpeaking } from './speech.js';
import { icon } from './art.js';
import { h, button } from './ui.js';
import { keepAwake } from './media.js';
import { clearEffects } from './motion.js';

const routes = [];
let current = null;
let navToken = 0;
let lastPath = null;
const listeners = new Set();

export function route(pattern, loader) {
  const keys = [];
  const regex = new RegExp('^' + pattern.replace(/\/:(\w+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }) + '/?$');
  routes.push({ pattern, regex, keys, loader });
}

export function currentPath() {
  return (location.hash || '#/').slice(1).split('?')[0] || '/';
}

export function navigate(path, { replace = false } = {}) {
  const target = '#' + path;
  if (location.hash === target) {
    render();
    return;
  }
  if (replace) {
    history.replaceState(null, '', target);
    render();
  } else {
    location.hash = target;
  }
}

export function onRoute(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ---------- Family settings unlock (lasts 30 minutes) ---------- */
const CARE_KEY = 'yaadein.care';
export function unlockCare() {
  try { sessionStorage.setItem(CARE_KEY, String(Date.now())); } catch { /* ignore */ }
}
export function lockCare() {
  try { sessionStorage.removeItem(CARE_KEY); } catch { /* ignore */ }
}
export function careUnlocked() {
  try {
    const at = Number(sessionStorage.getItem(CARE_KEY) || 0);
    if (at && Date.now() - at < 30 * 60 * 1000) {
      sessionStorage.setItem(CARE_KEY, String(Date.now()));
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

/* ---------- Top bar ---------- */
const app = () => document.getElementById('app');
const topbar = () => document.getElementById('topbar');
let repeatFn = null;

function setupTopbar() {
  const homeBtn = document.getElementById('homeBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  repeatBtn.querySelector('.topbar-repeat-icon').innerHTML = icon('speaker');
  homeBtn.addEventListener('click', () => {
    const target = homeBtn.dataset.target || '/';
    navigate(target);
  });
  let last = 0;
  repeatBtn.addEventListener('click', () => {
    const now = performance.now();
    if (now - last < 450) return;
    last = now;
    if (repeatFn) repeatFn();
  });
  onSpeaking((on) => repeatBtn.classList.toggle('speaking', on));
}

function updateTopbar(mod, ctx) {
  const bar = topbar();
  const show = mod.title !== null;
  bar.hidden = !show;
  if (!show) return;
  const back = typeof mod.back === 'function' ? mod.back(ctx.params, ctx.from) : (mod.back || '/');
  const homeBtn = document.getElementById('homeBtn');
  homeBtn.dataset.target = back;
  const isHome = back === '/';
  homeBtn.querySelector('.topbar-home-icon').innerHTML = icon(isHome ? 'home' : 'back');
  const label = isHome ? t('common.home') : t('common.back');
  document.getElementById('homeLabel').textContent = label;
  homeBtn.setAttribute('aria-label', label);
  const repeatBtn = document.getElementById('repeatBtn');
  repeatBtn.hidden = mod.mode === 'care';
  document.getElementById('repeatLabel').textContent = t('common.repeat');
  repeatBtn.setAttribute('aria-label', t('common.repeat'));
  setTitle(typeof mod.title === 'function' ? mod.title(ctx.params) : t(mod.title));
}

export function setTitle(text) {
  const el = document.getElementById('screenTitle');
  if (el) el.textContent = text || '';
  document.title = text ? `${text} · Yaadein` : 'Yaadein';
}

/* ---------- Rendering ---------- */
function match(path) {
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { route: r, params };
    }
  }
  return null;
}

function teardown() {
  if (current && current.cleanup) {
    try { current.cleanup(); } catch (err) { console.error(err); }
  }
  current = null;
  stopSpeech();
  keepAwake(false);
  clearEffects();
  document.querySelectorAll('.sheet-backdrop').forEach((el) => el.remove());
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.innerHTML = '';
}

function errorScreen(screen, err) {
  console.error(err);
  screen.replaceChildren(
    h('div', { class: 'empty' },
      h('h2', { class: 'empty-title' }, t('common.oops')),
      h('div', { class: 'empty-action' },
        button({ label: t('common.home'), iconName: 'home', kind: 'primary', onTap: () => navigate('/') }))),
  );
}

export async function render() {
  const path = currentPath();
  const found = match(path);
  const my = ++navToken;
  teardown();
  if (!found) {
    navigate('/', { replace: true });
    return;
  }
  let mod;
  try {
    mod = (await found.route.loader()).default;
  } catch (err) {
    if (my !== navToken) return;
    const view = document.getElementById('view');
    const screen = h('section', { class: 'screen' });
    view.replaceChildren(screen);
    errorScreen(screen, err);
    return;
  }
  if (my !== navToken) return;
  if (mod.mode === 'care' && !careUnlocked()) {
    navigate('/', { replace: true });
    return;
  }

  const from = lastPath;
  lastPath = path;
  const ctx = {
    params: found.params,
    path,
    from,
    navigate,
    setTitle,
    setRepeat(fn) { repeatFn = fn; },
    isCurrent: () => my === navToken,
  };
  repeatFn = typeof mod.title === 'string' ? () => say(mod.title) : null;

  const root = app();
  root.dataset.tone = mod.tone || 'clay';
  root.dataset.mode = mod.mode || 'patient';
  root.dataset.screen = found.route.pattern;
  updateTopbar(mod, ctx);

  const view = document.getElementById('view');
  const screen = h('section', { class: `screen enter ${mod.screenClass || ''}` });
  view.replaceChildren(screen);
  window.scrollTo(0, 0);
  view.focus({ preventScroll: true });

  try {
    const cleanup = await mod.mount(screen, found.params, ctx);
    if (my !== navToken) {
      if (typeof cleanup === 'function') cleanup();
      return;
    }
    current = { cleanup: typeof cleanup === 'function' ? cleanup : null, path };
  } catch (err) {
    if (my === navToken) errorScreen(screen, err);
  }
  listeners.forEach((fn) => fn(path));
}

export function startRouter() {
  setupTopbar();
  window.addEventListener('hashchange', render);
  render();
}

/* Re-render the current screen (after a language change, for example). */
export function refresh() {
  render();
}
