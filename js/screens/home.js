import { settings } from '../core/store.js';
import { t, partOfDay, formatDate, formatTime, pack, PACKS, LANG_ORDER } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { h, tile, holdButton, sheet, tap } from '../core/ui.js';
import { art, icon, C, starPath } from '../core/art.js';
import { navigate, unlockCare, refresh } from '../core/router.js';
import { sound } from '../core/sound.js';

let veilShown = false;
let lastGreeting = 0;

function greetingVars() {
  const s = settings.get();
  const part = partOfDay();
  const greeting = { key: s.islamic ? 'greet.salaam' : `greet.${part}` };
  return s.patientName ? { key: 'greet.named', vars: { greeting, name: s.patientName } } : greeting;
}

function timeVars(now = new Date()) {
  return { day: { key: `day.${now.getDay()}` }, part: { key: `part.${partOfDay(now)}` } };
}

/* The sky in the corner follows the real time of day. */
function skyArt(part) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const r1 = 48;
    const r2 = i % 2 ? 60 : 68;
    return `<path d="M${(100 + r1 * Math.cos(a)).toFixed(1)},${(100 + r1 * Math.sin(a)).toFixed(1)} L${(100 + r2 * Math.cos(a)).toFixed(1)},${(100 + r2 * Math.sin(a)).toFixed(1)}" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>`;
  }).join('');
  const cloud = (x, y, s, cls) => `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})"><path d="M0,24 C0,12 12,6 22,10 C26,0 44,-2 50,10 C62,8 70,16 68,26 C68,32 62,34 56,34 H8 C3,34 0,30 0,24 Z" fill="${C.card}" stroke="${C.ink}" stroke-width="2.6" stroke-linejoin="round"/></g>`;
  if (part === 'night') {
    const stars = [[48, 52, 7], [150, 40, 5], [160, 128, 6], [40, 140, 5], [120, 26, 4]]
      .map(([x, y, s], i) => `<path class="twinkle" style="--d:${i * 0.6}s" d="${starPath(x, y, s, s * 0.45, 4, -90)}" fill="${C.manilla}"/>`).join('');
    return `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="#2f4f73"/>${stars}`
      + `<path class="moon" d="M122,52 A52,52 0 1,0 142,132 A42,42 0 1,1 122,52 Z" fill="${C.manilla}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  }
  if (part === 'evening') {
    return `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><clipPath id="sky-clip"><circle cx="100" cy="100" r="96"/></clipPath></defs>`
      + `<g clip-path="url(#sky-clip)"><rect width="200" height="200" fill="${C.claySoft}"/>`
      + `<circle class="sun-core" cx="100" cy="128" r="44" fill="${C.clay}" stroke="${C.ink}" stroke-width="3"/>`
      + `<path d="M0,140 C40,122 80,126 110,138 C140,150 170,142 200,132 V200 H0 Z" fill="${C.sage}" stroke="${C.ink}" stroke-width="3"/></g>`
      + `<path class="bird" d="M52,62 q8,-8 16,0 q8,-8 16,0" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`
      + `<path class="bird b2" d="M120,46 q6,-6 12,0 q6,-6 12,0" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`
      + cloud(116, 70, 0.8, 'cloud') + `</svg>`;
  }
  const y = part === 'morning' ? 112 : 92;
  const bg = part === 'morning' ? C.clayTint : C.skyTint;
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="${bg}"/>`
    + `<g transform="translate(0 ${y - 100})"><g class="sun-rays">${rays}</g>`
    + `<circle class="sun-core" cx="100" cy="100" r="38" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/></g>`
    + cloud(18, 128, 0.9, 'cloud') + cloud(128, 38, 0.6, 'cloud c2') + `</svg>`;
}

function languageSheet() {
  const current = settings.get().lang;
  const grid = h('div', { class: 'lang-grid' });
  const s = sheet({ title: t('home.chooseLanguage'), body: grid });
  LANG_ORDER.forEach((code) => {
    const p = PACKS[code];
    const choice = h('button', { type: 'button', class: 'lang-choice', 'aria-pressed': String(code === current), lang: p.meta.htmlLang },
      h('span', { class: `lang-native ${p.meta.script === 'ur' ? 'ur-text' : p.meta.script}` }, p.meta.native),
      h('span', { class: 'lang-english' }, p.meta.nativeAlt ? `${p.meta.name} · ${p.meta.nativeAlt}` : p.meta.name));
    tap(choice, () => {
      sound.select();
      settings.set({ lang: code });
      s.close();
      refresh();
    });
    grid.append(choice);
  });
}

export default {
  title: null,
  tone: 'clay',
  screenClass: 'home-screen',
  mount(root, _params, ctx) {
    const s = settings.get();
    const now = new Date();
    const part = partOfDay(now);
    const langPack = pack();

    const greetingEl = h('h1', { class: 'greeting' });
    const todayEl = h('p', { class: 'today' });
    const clockEl = h('p', { class: 'clock' });
    const skyEl = h('div', { class: 'sky', html: skyArt(part) });

    function paintTime() {
      const d = new Date();
      greetingEl.textContent = t(greetingVars().key, greetingVars().vars);
      todayEl.textContent = t('time.now', timeVars(d));
      clockEl.replaceChildren(
        h('span', { class: 'clock-icon', html: icon('clock') }),
        h('span', { class: 'clock-time' }, formatTime(d)),
        h('span', { class: 'clock-sep', 'aria-hidden': 'true' }, '·'),
        h('span', { class: 'clock-date' }, formatDate(d)),
      );
    }
    paintTime();
    const timer = setInterval(paintTime, 30000);

    const speakGreeting = async () => {
      lastGreeting = Date.now();
      const g = greetingVars();
      await say(g.key, g.vars);
      if (!ctx.isCurrent()) return;
      await say('time.now', timeVars());
    };
    ctx.setRepeat(speakGreeting);
    tap(greetingEl, speakGreeting);
    tap(todayEl, () => say('time.now', timeVars()));

    const tiles = s.islamic
      ? [
        { artName: 'family', labelKey: 'home.family', tone: 'clay', to: '/family' },
        { artName: 'songs', labelKey: 'home.songs', tone: 'sky', to: '/music/songs' },
        { artName: 'naats', labelKey: 'home.naats', tone: 'sage', to: '/music/naats' },
        { artName: 'games', labelKey: 'home.games', tone: 'kraft', to: '/games' },
        { artName: 'tasbeeh', labelKey: 'home.tasbeeh', tone: 'clay', to: '/tasbeeh' },
        { artName: 'relax', labelKey: 'home.relax', tone: 'lilac', to: '/breathe' },
      ]
      : [
        { artName: 'family', labelKey: 'home.family', tone: 'clay', to: '/family' },
        { artName: 'songs', labelKey: 'home.songs', tone: 'sky', to: '/music/songs' },
        { artName: 'games', labelKey: 'home.games', tone: 'kraft', to: '/games' },
        { artName: 'coloring', labelKey: 'games.coloring', tone: 'sage', to: '/coloring' },
        { artName: 'sing', labelKey: 'games.sing', tone: 'sky', to: '/sing' },
        { artName: 'relax', labelKey: 'home.relax', tone: 'lilac', to: '/breathe' },
      ];

    const grid = h('nav', { class: 'tiles home-tiles stagger', 'aria-label': t('home.prompt') },
      tiles.map((item, i) => tile({
        artName: item.artName,
        labelKey: item.labelKey,
        tone: item.tone,
        index: i,
        speak: false,
        onTap: () => navigate(item.to),
      })));

    const langBtn = h('button', { type: 'button', class: 'lang-button', 'aria-label': t('home.language') },
      h('span', { class: 'lang-button-icon', html: icon('globe') }),
      h('span', { class: `lang-button-name ${langPack.meta.script === 'ur' ? 'ur-text' : ''}` }, langPack.meta.native));
    tap(langBtn, () => { sound.tap(); languageSheet(); });

    const care = holdButton({
      label: t('home.care'),
      hint: t('home.holdHint'),
      onDone: () => { unlockCare(); navigate('/care'); },
    });

    root.append(
      h('header', { class: 'home-top' },
        h('div', { class: 'brand' },
          h('span', { class: 'brand-mark', html: art('logo', '') }),
          h('span', { class: 'brand-name' }, 'Yaadein')),
        h('div', { class: 'home-tools' }, langBtn, care)),
      h('section', { class: 'hero' },
        h('div', { class: 'hero-text' }, greetingEl, todayEl, clockEl),
        skyEl),
      grid,
    );

    /* After a cold start the browser won't let us speak until the first touch,
       so greet them with a gentle "touch anywhere" screen. */
    const activated = navigator.userActivation ? navigator.userActivation.hasBeenActive : veilShown;
    let veil = null;
    if (!activated && !veilShown) {
      veilShown = true;
      veil = h('div', { class: 'wake-veil', role: 'button', tabindex: '0', 'aria-label': t('common.tapToStart') },
        h('div', { class: 'wake-card' },
          h('div', { class: 'wake-sky', html: skyArt(part) }),
          h('p', { class: 'wake-greeting' }, t(greetingVars().key, greetingVars().vars)),
          h('p', { class: 'wake-hint' },
            h('span', { class: 'wake-hand', html: icon('hand') }),
            h('span', null, t('common.tapToStart')))));
      const wake = () => {
        veil.classList.add('leaving');
        setTimeout(() => veil.remove(), 450);
        speakGreeting();
      };
      veil.addEventListener('click', wake, { once: true });
      veil.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') wake(); }, { once: true });
      document.getElementById('app').append(veil);
    } else if (Date.now() - lastGreeting > 10 * 60 * 1000) {
      speakGreeting();
    } else {
      say('home.prompt');
    }

    return () => {
      clearInterval(timer);
      if (veil && veil.isConnected) veil.remove();
    };
  },
};

