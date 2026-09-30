// Language packs, text lookup and date/number formatting.
import en from '../lang/en.js';
import hi from '../lang/hi.js';
import ur from '../lang/ur.js';
import mem from '../lang/mem.js';
import { settings } from './store.js';

export const PACKS = { en, hi, ur, mem };
export const LANG_ORDER = ['en', 'hi', 'ur', 'mem'];

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

export function lang() {
  const code = settings.get().lang;
  return PACKS[code] ? code : 'en';
}

export function pack(code = lang()) {
  return PACKS[code] || en;
}

/* A word the family changed in "Words & voices". */
export function override(key, code = lang()) {
  const all = settings.get().overrides;
  const value = all && all[code] && all[code][key];
  return typeof value === 'string' && value.trim() ? value : null;
}

/* The text for a key in one language only (no English fallback). */
export function raw(key, code = lang()) {
  const edited = override(key, code);
  if (edited) return edited;
  const p = PACKS[code];
  return p && has(p.strings, key) ? p.strings[key] : null;
}

export function t(key, vars, code = lang()) {
  const s = raw(key, code) ?? raw(key, 'en') ?? key;
  return interpolate(s, vars, (v) => resolveVar(v, code));
}

function resolveVar(v, code) {
  if (v && typeof v === 'object' && v.key) return t(v.key, v.vars, code);
  return v == null ? '' : String(v);
}

export function interpolate(s, vars, resolve = (v) => (v == null ? '' : String(v))) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (has(vars, k) ? resolve(vars[k]) : m));
}

/* Is this key translated in the language (as opposed to falling back to English)? */
export function isTranslated(key, code = lang()) {
  return raw(key, code) != null;
}

export function applyLanguage() {
  const p = pack();
  const root = document.documentElement;
  root.lang = p.meta.htmlLang;
  root.dir = p.meta.dir;
  root.dataset.lang = p.meta.code;
  root.dataset.script = p.meta.script;
}

/* ---------- Praise ---------- */
const PRAISE = ['praise.0', 'praise.1', 'praise.2', 'praise.3', 'praise.4'];
let lastPraise = -1;
export function praiseKey() {
  const keys = settings.get().islamic ? [...PRAISE, 'praise.islamic'] : PRAISE;
  let i;
  do { i = Math.floor(Math.random() * keys.length); } while (keys.length > 1 && i === lastPraise);
  lastPraise = i;
  return keys[i];
}

/* ---------- Time ---------- */
export function partOfDay(d = new Date()) {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 20) return 'evening';
  return 'night';
}

export function formatDate(d = new Date(), code = lang()) {
  const p = pack(code);
  if (p.meta.intl) {
    try { return new Intl.DateTimeFormat(p.meta.intl, { day: 'numeric', month: 'long' }).format(d); } catch { /* fall through */ }
  }
  return `${d.getDate()} ${t('month.' + d.getMonth(), null, code)}`;
}

export function formatTime(d = new Date(), code = lang()) {
  const p = pack(code);
  try {
    const fmt = new Intl.DateTimeFormat(p.meta.timeIntl || p.meta.intl || 'en-IN', { hour: 'numeric', minute: '2-digit' });
    if (!p.meta.clockWithoutPeriod) return fmt.format(d);
    // Urdu shows "AM/PM" in Latin letters; the day-part is already spoken in words.
    return fmt.formatToParts(d).filter((part) => part.type !== 'dayPeriod').map((part) => part.value).join('').trim();
  } catch {
    const h = d.getHours() % 12 || 12;
    return `${h}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

export function formatNumber(n, code = lang()) {
  const p = pack(code);
  if (p.meta.digits) {
    try { return new Intl.NumberFormat(p.meta.digits).format(n); } catch { /* fall through */ }
  }
  return String(n);
}
