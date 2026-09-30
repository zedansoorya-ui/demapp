// Speaking to the patient.
// Order of preference for every phrase:
//   1. a voice the family recorded for that phrase ("Words & voices"),
//   2. a computer voice for the chosen language,
//   3. the language's fallback: Urdu -> the Hindi phrase (spoken Hindi and Urdu are
//      nearly the same, and far more devices have a Hindi voice); Memoni -> Memoni
//      written in Devanagari, read by a Hindi voice (no device speaks Memoni).
import { settings, db } from './store.js';
import { PACKS, lang, t, override, interpolate } from './i18n.js';
import { playBlob, stopAudio } from './media.js';
import { toDevanagari } from './translit.js';

const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
let voiceList = [];

function refreshVoices() {
  if (synth) voiceList = synth.getVoices() || [];
}
if (synth) {
  refreshVoices();
  if (synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoices);
  else synth.onvoiceschanged = refreshVoices;
}

export function speechSupported() {
  return !!synth;
}

export function waitForVoices(timeout = 1500) {
  if (!synth) return Promise.resolve([]);
  refreshVoices();
  if (voiceList.length) return Promise.resolve(voiceList);
  return new Promise((resolve) => {
    const finish = () => { refreshVoices(); resolve(voiceList); };
    const timer = setTimeout(finish, timeout);
    const onChange = () => { clearTimeout(timer); finish(); };
    if (synth.addEventListener) synth.addEventListener('voiceschanged', onChange, { once: true });
  });
}

const GOOD_VOICE = /(natural|neural|premium|enhanced|google|siri|online)/i;
const norm = (s) => String(s || '').toLowerCase().replace('_', '-');

/* Voices matching the tags, best first (earlier tags win, nicer voices win). */
export function voicesForTags(tags) {
  refreshVoices();
  const scored = [];
  const seen = new Set();
  tags.forEach((tag, rank) => {
    const want = norm(tag);
    voiceList.forEach((v) => {
      const have = norm(v.lang);
      const match = want.includes('-') ? have === want : (have === want || have.startsWith(want + '-'));
      if (match && !seen.has(v.voiceURI)) {
        seen.add(v.voiceURI);
        scored.push({ v, score: rank * 10 - (GOOD_VOICE.test(v.name) ? 2 : 0) });
      }
    });
  });
  return scored.sort((a, b) => a.score - b.score).map((x) => x.v);
}

export function voicesFor(code) {
  const p = PACKS[code];
  return p && p.meta.voices.length ? voicesForTags(p.meta.voices) : [];
}

export function voiceFor(code) {
  const list = voicesFor(code);
  const preferred = settings.get().voices && settings.get().voices[code];
  if (preferred) {
    const chosen = list.find((v) => v.voiceURI === preferred);
    if (chosen) return chosen;
  }
  return list[0] || null;
}

/* How a Memoni (or other fallback-script) phrase should sound. */
function spokenForm(key, vars, code) {
  const p = PACKS[code];
  const edited = override(key, code);
  let s;
  if (edited) s = toDevanagari(edited);
  else if (p.speech && p.speech[key] != null) s = p.speech[key];
  else if (p.strings[key] != null) s = toDevanagari(p.strings[key]);
  else s = t(key, null, 'hi');
  return interpolate(s, vars, (v) => {
    if (v && typeof v === 'object' && v.key) return spokenForm(v.key, v.vars, code);
    return toDevanagari(v == null ? '' : String(v));
  });
}

/* Returns { text, voice } describing how to speak a phrase, or null if no voice can. */
export function speechPlan(key, vars, code = lang()) {
  const voice = voiceFor(code);
  if (voice) return { text: t(key, vars, code), voice };
  const fb = PACKS[code] && PACKS[code].meta.fallback;
  if (!fb) return null;
  const fbVoice = voiceFor(fb.lang);
  if (!fbVoice) return null;
  const text = fb.source === 'speech' ? spokenForm(key, vars, code) : t(key, vars, fb.lang);
  return { text, voice: fbVoice };
}

/* For free text such as a name typed by the family. */
function textPlan(text, code = lang()) {
  const voice = voiceFor(code);
  if (voice) return { text, voice };
  const fb = PACKS[code] && PACKS[code].meta.fallback;
  if (!fb) return null;
  const fbVoice = voiceFor(fb.lang);
  if (!fbVoice) return null;
  return { text: fb.source === 'speech' ? toDevanagari(text) : text, voice: fbVoice };
}

/* ---------- Speaking state (the "say it again" button pulses) ---------- */
let token = 0;
let speaking = false;
const speakingListeners = new Set();
function setSpeaking(value) {
  if (speaking === value) return;
  speaking = value;
  speakingListeners.forEach((fn) => fn(value));
}
export function onSpeaking(fn) {
  speakingListeners.add(fn);
  return () => speakingListeners.delete(fn);
}

export function stop() {
  token += 1;
  if (synth) synth.cancel();
  stopAudio();
  setSpeaking(false);
}

/* ---------- Family recordings ---------- */
let clipIds = null;
async function loadClipIds() {
  clipIds = new Set(await db.keys('clips'));
}
db.onChange('clips', loadClipIds);

export async function getClip(code, key) {
  if (!clipIds) await loadClipIds();
  const id = `${code}:${key}`;
  return clipIds.has(id) ? db.get('clips', id) : null;
}

/* ---------- Public API ---------- */
function utter(text, voice, my, rate) {
  if (!synth || !text || !voice) return Promise.resolve();
  return new Promise((resolve) => {
    // Chrome sometimes drops speech queued immediately after cancel().
    setTimeout(() => {
      if (my !== token) { resolve(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = rate;
      u.pitch = 1;
      u.volume = 1;
      let finished = false;
      const guard = setTimeout(() => finish(), 3000 + text.length * 140);
      function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(guard);
        if (my === token) setSpeaking(false);
        resolve();
      }
      u.onend = finish;
      u.onerror = finish;
      setSpeaking(true);
      synth.speak(u);
      if (synth.paused) synth.resume();
    }, 60);
  });
}

function begin() {
  const my = ++token;
  if (synth) synth.cancel();
  stopAudio();
  return my;
}

async function playClip(blob, my) {
  setSpeaking(true);
  await playBlob(blob);
  if (my === token) setSpeaking(false);
}

/* Speak a phrase by key. Resolves when finished (or interrupted). */
export async function say(key, vars, opts = {}) {
  if (!settings.get().speech && !opts.force) return;
  const code = opts.lang || lang();
  const my = begin();
  if (!vars) {
    const clip = await getClip(code, key);
    if (my !== token) return;
    if (clip && clip.blob) { await playClip(clip.blob, my); return; }
  }
  const plan = speechPlan(key, vars, code);
  if (!plan) return;
  await utter(plan.text, plan.voice, my, opts.rate || settings.get().rate);
}

/* Speak free text in a language. */
export async function sayText(text, opts = {}) {
  if (!settings.get().speech && !opts.force) return;
  const my = begin();
  const plan = textPlan(text, opts.lang || lang());
  if (!plan) return;
  await utter(plan.text, plan.voice, my, opts.rate || settings.get().rate);
}

/* Play a recording (a loved one's voice), treated like speech so it can be interrupted. */
export async function sayBlob(blob) {
  const my = begin();
  await playClip(blob, my);
}

/* Test a particular voice from the settings screen. */
export function preview(text, voice) {
  const my = begin();
  return utter(text, voice, my, settings.get().rate);
}

export function isSpeaking() {
  return speaking;
}
