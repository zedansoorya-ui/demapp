import { settings } from '../../core/store.js';
import { t, lang, PACKS } from '../../core/i18n.js';
import { say, voicesFor, voiceFor, waitForVoices, speechSupported } from '../../core/speech.js';
import { h, button } from '../../core/ui.js';
import { section, toggleRow, segmented, field } from './widgets.js';

export default {
  title: 'care.display',
  back: '/care',
  mode: 'care',
  tone: 'care',
  async mount(root, _params, ctx) {
    const s = settings.get();
    const code = lang();
    const p = PACKS[code];
    await waitForVoices();
    if (!ctx.isCurrent()) return;

    /* Voice for the chosen language, and what happens when there is none. */
    const voiceBox = h('div', { class: 'stack' });
    const list = voicesFor(code);
    if (list.length) {
      const select = h('select', { class: 'select', 'aria-label': t('care.voiceFor', { lang: p.meta.native }) },
        h('option', { value: '' }, t('care.voiceAuto')),
        list.map((v) => h('option', { value: v.voiceURI, selected: (s.voices || {})[code] === v.voiceURI ? true : null }, `${v.name} (${v.lang})`)));
      select.addEventListener('change', () => {
        settings.set({ voices: { ...(settings.get().voices || {}), [code]: select.value } });
        say('home.prompt', null, { force: true });
      });
      voiceBox.append(field(t('care.voiceFor', { lang: p.meta.native }), select));
    } else {
      const fb = p.meta.fallback;
      const fbVoice = fb ? voiceFor(fb.lang) : null;
      voiceBox.append(h('p', { class: 'care-note' },
        t('care.voiceNone', { lang: p.meta.native }), ' ',
        fbVoice ? t('care.voiceFallback') : t('care.voiceMissing')));
    }
    if (!speechSupported()) voiceBox.append(h('p', { class: 'care-note' }, t('care.voiceMissing')));
    voiceBox.append(button({ label: t('care.testVoice'), iconName: 'speaker', kind: 'secondary', size: 'small', onTap: () => say('home.prompt', null, { force: true }) }));

    const volume = h('input', { type: 'range', class: 'range', min: '0', max: '1', step: '0.05', value: String(s.volume), 'aria-label': t('care.volume') });
    volume.addEventListener('input', () => settings.set({ volume: Number(volume.value) }));

    root.append(
      section(t('care.speech'),
        toggleRow({ title: t('care.speech'), sub: t('care.speechSub'), value: s.speech, onChange: (v) => settings.set({ speech: v }) }),
        field(t('care.rate'), segmented([[0.75, t('care.slower')], [0.9, t('care.normal')]], s.rate <= 0.8 ? 0.75 : 0.9, (v) => { settings.set({ rate: v }); say('home.prompt', null, { force: true }); })),
        voiceBox),
      section(t('care.volume'), volume),
      section(t('care.textSize'),
        segmented([['l', t('care.large')], ['xl', t('care.extraLarge')]], s.text, (v) => settings.set({ text: v }))),
      section(null,
        toggleRow({ title: t('care.calm'), sub: t('care.calmSub'), value: s.calm, onChange: (v) => settings.set({ calm: v }) }),
        toggleRow({ title: t('care.islamic'), sub: t('care.islamicSub'), value: s.islamic, onChange: (v) => settings.set({ islamic: v }) }),
        toggleRow({ title: t('care.idle'), sub: t('care.idleSub'), value: s.idlePhotos, onChange: (v) => settings.set({ idlePhotos: v }) })),
      section(t('care.faceChoices'),
        segmented([[2, '2'], [3, '3'], [4, '4']], s.faceChoices, (v) => settings.set({ faceChoices: v }))),
    );
  },
};
