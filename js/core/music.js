// Songs: the built-in catalogue plus the ones the family adds.
import { db, settings } from './store.js';
import { lang } from './i18n.js';
import { CATALOG, LYRICS } from '../data/catalog.js';
import { C, circ, starPath, sparkle } from './art.js';

export async function songsFor(cat, { includeHidden = false } = {}) {
  const hidden = new Set(settings.get().hiddenSongs || []);
  if (cat === 'words') {
    // Everything with public-domain words to sing along with.
    const islamic = settings.get().islamic;
    return CATALOG.filter((s) => s.lyrics && (islamic || s.cat !== 'naats') && (includeHidden || !hidden.has(s.id)));
  }
  const family = (await db.all('songs'))
    .filter((s) => s.cat === cat)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map((s) => ({ ...s, family: true }));
  const builtIn = CATALOG.filter((s) => s.cat === cat && (includeHidden || !hidden.has(s.id)));
  return [...family, ...builtIn];
}

/* Pick the script that suits the reader. */
export function normalizeCat(cat) {
  return cat === 'naats' || cat === 'words' ? cat : 'songs';
}

export function catTitleKey(cat) {
  return cat === 'naats' ? 'music.naats' : cat === 'words' ? 'sing.songs' : 'music.songs';
}

export function localized(value, code = lang()) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (code === 'ur') return value.ur || value.rom;
  if (code === 'hi') return value.hi || value.rom;
  return value.rom;
}

export function songTitle(song) { return localized(song.title); }
export function songArtist(song) { return localized(song.artist); }

export function songMeta(song) {
  const parts = [songArtist(song)];
  const film = localized(song.film);
  if (film) parts.push(film);
  if (song.year) parts.push(String(song.year));
  return parts.filter(Boolean).join(' · ');
}

export function lyricsFor(song) {
  return song.lyrics ? LYRICS[song.lyrics] || null : null;
}

/* ---------- Cover art ---------- */
function hueOf(song) {
  if (typeof song.hue === 'number') return song.hue;
  let h = 0;
  for (const ch of String(song.id)) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export function coverArt(song) {
  if (song.family) {
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="${circ(60, 60, 56)}" fill="${C.clayTint}" stroke="${C.ink}" stroke-width="3"/>`
      + `<path d="M60,90 C38,76 28,64 32,50 C36,38 52,36 60,48 C68,36 84,38 88,50 C92,64 82,76 60,90 Z" fill="${C.clay}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="${sparkle(92, 28, 7)}" fill="${C.gold}"/></svg>`;
  }
  if (song.cat === 'naats') {
    const h = hueOf(song) % 40;
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="${circ(60, 60, 56)}" fill="hsl(${90 + h} 28% 90%)" stroke="${C.ink}" stroke-width="3"/>`
      + `<path d="M36,86 V70 H84 V86 Z" fill="${C.manilla}" stroke="${C.ink}" stroke-width="2.6" stroke-linejoin="round"/>`
      + `<path d="M38,70 C38,52 46,42 60,36 C74,42 82,52 82,70 Z" fill="${C.sage}" stroke="${C.ink}" stroke-width="2.6" stroke-linejoin="round"/>`
      + `<path d="M60,36 V26" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M57.5,18.5 A5.4,5.4 0 1,0 64.6,25.4 A4.3,4.3 0 1,1 57.5,18.5 Z" fill="${C.gold}" stroke="${C.ink}" stroke-width="1.8"/>`
      + `<path d="${starPath(90, 38, 5, 2.2, 5)}" fill="${C.gold}"/><path d="${starPath(30, 44, 4, 1.8, 5)}" fill="${C.gold}"/></svg>`;
  }
  const hue = hueOf(song);
  const grooves = [44, 38, 32].map((r) => `<path d="${circ(60, 60, r)}" fill="none" stroke="#3a3a37" stroke-width="1.4"/>`).join('');
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="${circ(60, 60, 56)}" fill="#1f1f1d" stroke="${C.ink}" stroke-width="3"/>${grooves}`
    + `<path d="M28,40 A38,38 0 0 1 48,24" stroke="rgba(255,255,255,.28)" stroke-width="4" fill="none" stroke-linecap="round"/>`
    + `<path d="${circ(60, 60, 21)}" fill="hsl(${hue} 55% 68%)"/><path d="${circ(60, 60, 21)}" fill="none" stroke="hsl(${hue} 40% 45%)" stroke-width="2"/>`
    + `<path d="${circ(60, 60, 3.5)}" fill="${C.paper}"/></svg>`;
}

/* ---------- YouTube ---------- */
export function parseYouTubeId(input) {
  const text = String(input || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;
  try {
    const url = new URL(text.startsWith('http') ? text : `https://${text}`);
    const host = url.hostname.replace(/^www\.|^m\.|^music\./, '');
    if (host === 'youtu.be') return url.pathname.slice(1, 12) || null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (url.searchParams.get('v')) return url.searchParams.get('v').slice(0, 11);
      const m = url.pathname.match(/\/(embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[2];
    }
  } catch { /* not a URL */ }
  return null;
}

let apiPromise = null;
export function loadYouTubeAPI(timeout = 15000) {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => { apiPromise = null; reject(new Error('YouTube did not load')); }, timeout);
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        if (typeof previous === 'function') previous();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => { clearTimeout(timer); apiPromise = null; reject(new Error('YouTube could not be reached')); };
      document.head.append(script);
    });
  }
  return apiPromise;
}
