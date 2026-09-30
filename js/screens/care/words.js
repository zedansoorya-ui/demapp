// Change any phrase, or record it in a family member's own voice.
import { settings, db } from '../../core/store.js';
import { t, lang, PACKS, LANG_ORDER, override } from '../../core/i18n.js';
import { say } from '../../core/speech.js';
import { h, iconButton } from '../../core/ui.js';
import { section, segmented, recorderWidget } from './widgets.js';

const PATIENT = ['greet.', 'time.', 'part.', 'day.', 'home.', 'family.', 'faces.', 'music.', 'games.', 'praise.', 'coloring.',
  'page.', 'color.', 'sing.', 'memory.', 'thing.', 'bubbles.', 'puzzle.', 'tasbeeh.', 'dhikr.', 'breathe.', 'common.'];
const SKIP = new Set(['common.save', 'common.cancel', 'common.delete', 'common.edit', 'common.add', 'common.close', 'home.care', 'home.holdHint']);

function sampleVars() {
  return {
    name: settings.get().patientName || 'Ammi',
    greeting: { key: 'greet.salaam' },
    relation: '…',
    day: { key: `day.${new Date().getDay()}` },
    part: { key: 'part.morning' },
    count: 33,
  };
}

export default {
  title: 'care.words',
  back: '/care',
  mode: 'care',
  tone: 'care',
  async mount(root, _params, ctx) {
    let code = lang();
    let query = '';
    const en = PACKS.en.strings;
    const keys = Object.keys(en).filter((k) => PATIENT.some((p) => k.startsWith(p)) && !SKIP.has(k));
    const note = h('p', { class: 'care-note' }, t('care.memoniNote'));
    const list = h('div', { class: 'words-list' });
    const search = h('input', { class: 'input', type: 'search', placeholder: t('care.wordsFilter'), 'aria-label': t('care.wordsFilter') });
    let widgets = [];
    let clips = new Map();

    async function loadClips() {
      const all = await db.all('clips');
      clips = new Map(all.filter((c) => c.lang === code).map((c) => [c.key, c.blob]));
    }

    function setOverride(key, value, base) {
      const all = { ...(settings.get().overrides || {}) };
      const forLang = { ...(all[code] || {}) };
      if (!value.trim() || value === base) delete forLang[key];
      else forLang[key] = value;
      all[code] = forLang;
      settings.set({ overrides: all });
    }

    function row(key) {
      const base = PACKS[code].strings[key] ?? en[key];
      const input = h('input', { class: 'input word-input', value: override(key, code) ?? base, dir: 'auto', lang: PACKS[code].meta.htmlLang, 'aria-label': en[key] });
      input.addEventListener('change', () => setOverride(key, input.value, base));
      const hasVars = /\{\w+\}/.test(base);
      const tools = h('div', { class: 'word-tools' },
        iconButton({ iconName: 'speaker', label: t('care.testVoice'), size: 'small', onTap: () => say(key, hasVars ? sampleVars() : null, { lang: code, force: true }) }),
        iconButton({ iconName: 'refresh', label: t('care.reset'), size: 'small', onTap: async () => {
          input.value = base;
          setOverride(key, base, base);
          await db.del('clips', `${code}:${key}`);
          clips.delete(key);
          render();
        } }));
      if (!hasVars) {
        const rec = recorderWidget({
          compact: true,
          maxMs: 8000,
          blob: clips.get(key) || null,
          onChange: async (blob) => {
            const id = `${code}:${key}`;
            if (blob) {
              await db.put('clips', { id, lang: code, key, blob, createdAt: Date.now() });
              clips.set(key, blob);
            } else {
              await db.del('clips', id);
              clips.delete(key);
            }
          },
        });
        widgets.push(rec);
        tools.prepend(rec);
      }
      return h('div', { class: 'word-row' },
        h('span', { class: 'word-key' }, code === 'en' ? key : en[key]),
        input,
        tools);
    }

    function render() {
      widgets.forEach((w) => w.dispose());
      widgets = [];
      note.hidden = code !== 'mem';
      const q = query.trim().toLowerCase();
      const shown = keys.filter((k) => !q
        || k.includes(q)
        || en[k].toLowerCase().includes(q)
        || String(override(k, code) ?? PACKS[code].strings[k] ?? '').toLowerCase().includes(q));
      list.replaceChildren(...shown.map(row));
    }

    search.addEventListener('input', () => { query = search.value; render(); });

    root.append(
      h('p', { class: 'care-intro' }, t('care.wordsIntro')),
      section(t('care.wordsLanguage'),
        segmented(LANG_ORDER.map((c) => [c, PACKS[c].meta.native]), code, async (v) => { code = v; await loadClips(); render(); })),
      note,
      section(t('care.patientWords'), search, list),
    );
    await loadClips();
    if (!ctx.isCurrent()) return;
    render();
    return () => widgets.forEach((w) => w.dispose());
  },
};
