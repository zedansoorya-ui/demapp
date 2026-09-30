import { settings } from '../core/store.js';
import { t, PACKS, LANG_ORDER } from '../core/i18n.js';
import { say, sayText } from '../core/speech.js';
import { h, button, tap } from '../core/ui.js';
import { art, icon } from '../core/art.js';
import { navigate } from '../core/router.js';
import { sound } from '../core/sound.js';
import { petals } from '../core/motion.js';

export default {
  title: null,
  tone: 'clay',
  screenClass: 'welcome-screen',
  mount(root) {
    let step = 0;
    const box = h('div', { class: 'welcome' });
    root.append(box);

    const dots = () => h('div', { class: 'steps', 'aria-hidden': 'true' },
      [0, 1, 2].map((i) => h('span', { class: `step-dot${i === step ? ' on' : ''}` })));

    function go(next) {
      step = next;
      render();
    }

    function stepLanguage() {
      const chosen = settings.get().lang;
      const grid = h('div', { class: 'lang-grid welcome-langs stagger' });
      LANG_ORDER.forEach((code, i) => {
        const p = PACKS[code];
        const choice = h('button', {
          type: 'button',
          class: 'lang-choice',
          style: `--i:${i + 2}`,
          'aria-pressed': String(chosen === code),
          lang: p.meta.htmlLang,
        },
        h('span', { class: `lang-native ${p.meta.script === 'ur' ? 'ur-text' : p.meta.script}` }, p.meta.native),
        h('span', { class: 'lang-english' }, p.meta.nativeAlt ? `${p.meta.name} · ${p.meta.nativeAlt}` : p.meta.name));
        tap(choice, () => {
          sound.select();
          settings.set({ lang: code });
          sayText(code === 'mem' ? 'Memoni' : p.meta.native, { lang: code, force: true });
          render();
        });
        grid.append(choice);
      });
      return [
        h('div', { class: 'welcome-mark', html: art('logo') }),
        h('h1', { class: 'welcome-title' }, chosen ? t('welcome.title') : 'Yaadein · यादें · یادیں'),
        h('p', { class: 'welcome-lead' }, chosen ? t('welcome.lead') : 'Welcome · स्वागत है · خوش آمدید'),
        h('h2', { class: 'welcome-question' }, chosen ? t('welcome.pickLanguage') : 'Choose a language · भाषा चुनें · زبان چنیں'),
        grid,
        h('div', { class: 'welcome-actions' },
          button({ label: t('common.continue'), iconName: 'forward', kind: 'primary', attrs: { disabled: chosen ? null : true }, onTap: () => go(1) })),
      ];
    }

    function stepName() {
      const input = h('input', {
        class: 'input welcome-input',
        type: 'text',
        autocomplete: 'off',
        autocapitalize: 'words',
        spellcheck: 'false',
        value: settings.get().patientName || '',
        'aria-label': t('welcome.nameTitle'),
        maxlength: '40',
      });
      const chips = h('div', { class: 'chips welcome-chips' },
        t('welcome.suggestions').split('|').map((name) => {
          const chip = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(input.value === name) }, name);
          tap(chip, () => {
            input.value = name;
            chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
            sound.tap();
          });
          return chip;
        }));
      input.addEventListener('input', () => {
        chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.textContent === input.value)));
      });
      const save = () => settings.set({ patientName: input.value.trim() });
      return [
        h('div', { class: 'welcome-mark small', html: art('family') }),
        h('h1', { class: 'welcome-title' }, t('welcome.nameTitle')),
        h('p', { class: 'welcome-lead' }, t('welcome.nameHint')),
        h('div', { class: 'welcome-field' }, input, chips),
        h('div', { class: 'welcome-actions' },
          button({ label: t('common.back'), iconName: 'back', kind: 'secondary', onTap: () => { save(); go(0); } }),
          button({ label: t('common.continue'), iconName: 'forward', kind: 'primary', onTap: () => { save(); go(2); } })),
      ];
    }

    function stepTips() {
      const tips = [
        ['people', 'welcome.tip1'],
        ['settings', 'welcome.tip2'],
        ['heart', 'welcome.tip3'],
        ['sparkle', 'welcome.tip4'],
      ];
      return [
        h('h1', { class: 'welcome-title' }, t('welcome.tipsTitle')),
        h('ul', { class: 'tips stagger' },
          tips.map(([ic, key], i) => h('li', { class: 'tip', style: `--i:${i}` },
            h('span', { class: 'tip-icon', html: icon(ic) }),
            h('span', { class: 'tip-text' }, t(key))))),
        h('div', { class: 'welcome-actions' },
          button({ label: t('common.back'), iconName: 'back', kind: 'secondary', onTap: () => go(1) }),
          button({
            label: t('welcome.start'),
            iconName: 'check',
            kind: 'clay',
            onTap: () => {
              settings.set({ onboarded: true });
              petals(50);
              sound.chime();
              navigate('/');
            },
          })),
      ];
    }

    function render() {
      const parts = step === 0 ? stepLanguage() : step === 1 ? stepName() : stepTips();
      box.replaceChildren(h('div', { class: 'welcome-card enter-card' }, ...parts, dots()));
      if (step === 1) {
        const input = box.querySelector('input');
        if (input) setTimeout(() => input.focus({ preventScroll: true }), 350);
      }
    }

    render();
    if (settings.get().lang) say('welcome.title');
  },
};
