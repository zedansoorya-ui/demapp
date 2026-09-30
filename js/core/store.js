// Everything stays on this device: small settings in localStorage,
// photos, voices, family songs and colouring progress in IndexedDB.

const DB_NAME = 'yaadein';
const DB_VERSION = 1;
export const STORES = ['people', 'songs', 'clips', 'art'];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const idb = req.result;
      for (const name of STORES) {
        if (!idb.objectStoreNames.contains(name)) idb.createObjectStore(name, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB upgrade blocked by another tab'));
  });
  dbPromise.catch(() => { dbPromise = null; });
  return dbPromise;
}

function run(store, mode, fn) {
  return openDB().then((idb) => new Promise((resolve, reject) => {
    const t = idb.transaction(store, mode);
    const request = fn(t.objectStore(store));
    t.oncomplete = () => resolve(request ? request.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Transaction aborted'));
  }));
}

const changeListeners = new Map();
function emit(store) {
  (changeListeners.get(store) || []).forEach((fn) => {
    try { fn(); } catch (err) { console.error(err); }
  });
}

export const db = {
  async all(store) {
    try { return (await run(store, 'readonly', (s) => s.getAll())) || []; }
    catch (err) { console.warn('db.all failed', store, err); return []; }
  },
  async keys(store) {
    try { return (await run(store, 'readonly', (s) => s.getAllKeys())) || []; }
    catch (err) { console.warn('db.keys failed', store, err); return []; }
  },
  async get(store, id) {
    try { return await run(store, 'readonly', (s) => s.get(id)); }
    catch (err) { console.warn('db.get failed', store, err); return undefined; }
  },
  async put(store, value) {
    await run(store, 'readwrite', (s) => s.put(value));
    emit(store);
    return value;
  },
  async del(store, id) {
    await run(store, 'readwrite', (s) => s.delete(id));
    emit(store);
  },
  async clear(store) {
    await run(store, 'readwrite', (s) => s.clear());
    emit(store);
  },
  async available() {
    try { await openDB(); return true; } catch { return false; }
  },
  onChange(store, fn) {
    if (!changeListeners.has(store)) changeListeners.set(store, new Set());
    changeListeners.get(store).add(fn);
    return () => changeListeners.get(store).delete(fn);
  },
};

export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/* ---------- Settings ---------- */

const KEY = 'yaadein.settings.v1';

export const DEFAULTS = Object.freeze({
  lang: null,            // null until the family picks one on first run
  patientName: '',
  speech: true,
  rate: 0.9,
  voices: {},            // language code -> preferred voiceURI
  volume: 0.7,
  text: 'l',             // 'l' large, 'xl' extra large
  calm: false,           // less movement
  islamic: true,         // Naat Sharif, Tasbeeh, Salaam greeting
  idlePhotos: true,      // show family photos after a quiet spell on the home screen
  faceChoices: 2,        // photos per question in "Who is this?"
  hiddenSongs: [],       // built-in songs the family has hidden
  overrides: {},         // { lang: { key: text } } from "Words & voices"
  onboarded: false,
});

let current = load();
const listeners = new Set();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

export const settings = {
  get() { return current; },
  set(patch) {
    current = { ...current, ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (err) { console.warn('Could not save settings', err); }
    listeners.forEach((fn) => {
      try { fn(current, patch); } catch (err) { console.error(err); }
    });
    return current;
  },
  replace(next) {
    current = { ...DEFAULTS, ...next };
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* ignore */ }
    listeners.forEach((fn) => fn(current, current));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/* Ask the browser not to clear family photos when space runs low. */
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch { /* not supported */ }
  return false;
}

export async function storageInfo() {
  const info = { usage: null, quota: null, persisted: false };
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      info.usage = est.usage;
      info.quota = est.quota;
    }
    if (navigator.storage && navigator.storage.persisted) info.persisted = await navigator.storage.persisted();
  } catch { /* ignore */ }
  return info;
}
