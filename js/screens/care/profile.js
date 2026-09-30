import { settings } from '../../core/store.js';
import { t, PACKS, LANG_ORDER } from '../../core/i18n.js';
import { h, tap, toast } from '../../core/ui.js';
import { refresh } from '../../core/router.js';
import { sound } from '../../core/sound.js';
import { section, field, textInput } from './widgets.js';

export default {
  title: 'care.profile',
  back: '/care',
  mode: 'care',
  tone: 'care',
  mount(root) {
    let saveTimer = 0;
    const name = textInput({
      value: settings.get().patientName,
      placeholder: t('welcome.suggestions').split('|')[0],
      maxlength: 40,
      onInput: (v) => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => { settings.set({ patientName: v.trim() }); toast(t('care.saved'), 1400); }, 600);
        chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.textContent === v)));
      },
    });
    const chips = h('div', { class: 'chips' },
      t('welcome.suggestions').split('|').map((s) => {
        const chip = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(settings.get().patientName === s) }, s);
        tap(chip, () => {
          name.value = s;
          settings.set({ patientName: s });
          chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
          sound.tap();
          toast(t('care.saved'), 1400);
        });
        return chip;
      }));

    const langs = h('div', { class: 'lang-grid' });
    LANG_ORDER.forEach((code) => {
      const p = PACKS[code];
      const choice = h('button', { type: 'button', class: 'lang-choice', 'aria-pressed': String(settings.get().lang === code), lang: p.meta.htmlLang },
        h('span', { class: `lang-native ${p.meta.script === 'ur' ? 'ur-text' : p.meta.script}` }, p.meta.native),
        h('span', { class: 'lang-english' }, p.meta.nativeAlt ? `${p.meta.name} · ${p.meta.nativeAlt}` : p.meta.name));
      tap(choice, () => {
        sound.select();
        settings.set({ lang: code });
        refresh();
      });
      langs.append(choice);
    });

    root.append(
      section(t('care.patientName'), field(t('care.patientName'), name, t('care.patientNameHint')), chips),
      section(t('care.language'), langs),
    );
    return () => {
      clearTimeout(saveTimer);
      if (name.value.trim() !== settings.get().patientName) settings.set({ patientName: name.value.trim() });
    };
  },
};
