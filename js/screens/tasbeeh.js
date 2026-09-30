// A tasbeeh that counts with a touch anywhere. The usual after-prayer sequence
// (SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34) moves on by itself.
import { t, lang, formatNumber } from '../core/i18n.js';
import { say, sayText } from '../core/speech.js';
import { h, button, celebrate, tap } from '../core/ui.js';
import { C } from '../core/art.js';
import { sound } from '../core/sound.js';
import { petals } from '../core/motion.js';

const DHIKR = [
  { id: 'subhanallah', ar: 'سُبْحَانَ اللّٰهِ', rom: 'SubhanAllah', hi: 'सुब्हानअल्लाह', target: 33 },
  { id: 'alhamdulillah', ar: 'اَلْحَمْدُ لِلّٰهِ', rom: 'Alhamdulillah', hi: 'अल्हम्दुलिल्लाह', target: 33 },
  { id: 'allahuakbar', ar: 'اَللّٰهُ أَكْبَرُ', rom: 'Allahu Akbar', hi: 'अल्लाहु अकबर', target: 34 },
  { id: 'tahlil', ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ', rom: 'La ilaha illallah', hi: 'ला इलाहा इल्लल्लाह', target: 100 },
  { id: 'astaghfirullah', ar: 'أَسْتَغْفِرُ اللّٰهَ', rom: 'Astaghfirullah', hi: 'अस्तग़फ़िरुल्लाह', target: 100 },
  { id: 'durood', ar: 'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ', rom: 'Allahumma salli ‘ala Muhammad', hi: 'अल्लाहुम्मा सल्लि अला मुहम्मद', target: 100 },
];
const FATIMAH = ['subhanallah', 'alhamdulillah', 'allahuakbar'];
const BEADS = 33;

export default {
  title: 'tasbeeh.title',
  tone: 'kraft',
  screenClass: 'tasbeeh-screen',
  mount(root, _params, ctx) {
    let mode = 'fatimah';
    let current = DHIKR[0];
    let count = 0;
    let step = 0;
    let busy = false;
    let alive = true;
    let taps = 0;

    const speakDhikr = (d) => {
      const code = lang();
      if (code === 'en') sayText(d.rom);
      else sayText(d.hi, { lang: 'hi' });
    };

    /* ---------- Bead ring ---------- */
    const R = 150;
    const beadEls = [];
    let beadsSvg = `<svg viewBox="0 0 400 400" class="beads-svg" aria-hidden="true"><g class="ring-rot"><circle cx="200" cy="200" r="${R}" fill="none" stroke="${C.kraft}" stroke-width="3"/>`;
    for (let i = 0; i < BEADS; i += 1) {
      const a = (i / BEADS) * Math.PI * 2 - Math.PI / 2;
      beadsSvg += `<circle class="bead" data-i="${i}" cx="${(200 + R * Math.cos(a)).toFixed(1)}" cy="${(200 + R * Math.sin(a)).toFixed(1)}" r="13" fill="${C.kraft}" stroke="${C.ink}" stroke-width="2.5"/>`;
    }
    beadsSvg += `</g><g class="imam"><circle cx="200" cy="${200 - R}" r="19" fill="${C.sage}" stroke="${C.ink}" stroke-width="2.5"/><path d="M193,${200 - R - 34} h14 l5,16 h-24 z" fill="${C.clay}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/></g></svg>`;
    const ring = h('div', { class: 'beads-ring', html: beadsSvg });
    ring.querySelectorAll('.bead').forEach((el) => beadEls.push(el));

    const countEl = h('div', { class: 'tasbeeh-count' });
    const targetEl = h('div', { class: 'tasbeeh-target' });
    const arEl = h('div', { class: 'tasbeeh-ar ar', lang: 'ar' });
    const trEl = h('div', { class: 'tasbeeh-tr' });
    const meaningEl = h('div', { class: 'tasbeeh-meaning' });
    const pad = h('button', { type: 'button', class: 'tasbeeh-pad', 'aria-label': t('tasbeeh.intro') },
      ring,
      h('div', { class: 'tasbeeh-center' }, countEl, targetEl));

    const chips = h('div', { class: 'dhikr-chips' });
    function renderChips() {
      const fatimah = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(mode === 'fatimah') }, t('tasbeeh.fatimah'));
      tap(fatimah, () => { mode = 'fatimah'; step = 0; select(DHIKR[0], true); renderChips(); });
      const list = DHIKR.slice(3).map((d) => {
        const code = lang();
        const label = code === 'ur' ? d.ar : code === 'hi' ? d.hi : d.rom;
        const c = h('button', { type: 'button', class: `chip${code === 'ur' ? ' ar' : ''}`, 'aria-pressed': String(mode === d.id) }, label);
        tap(c, () => { mode = d.id; select(d, true); renderChips(); });
        return c;
      });
      chips.replaceChildren(fatimah, ...list);
    }

    function paint() {
      countEl.textContent = formatNumber(count);
      targetEl.textContent = `/ ${formatNumber(current.target)}`;
      const lit = count % BEADS;
      const full = count > 0 && lit === 0;
      // The beads that most recently passed the marker are the counted ones.
      beadEls.forEach((el, i) => el.classList.toggle('lit', full || (((taps - 1 - i) % BEADS) + BEADS) % BEADS < lit));
      ring.style.setProperty('--turn', `${-taps * (360 / BEADS)}deg`);
    }

    function select(d, announce) {
      current = d;
      count = 0;
      arEl.textContent = d.ar;
      trEl.textContent = lang() === 'ur' ? '' : (lang() === 'hi' ? d.hi : d.rom);
      trEl.hidden = lang() === 'ur';
      meaningEl.textContent = t(`dhikr.${d.id}`);
      paint();
      if (announce) speakDhikr(d);
    }

    async function complete() {
      busy = true;
      sound.chime();
      petals(40);
      await say('tasbeeh.done', { count: formatNumber(current.target) });
      if (!alive) return;
      if (mode === 'fatimah' && step < FATIMAH.length - 1) {
        step += 1;
        select(DHIKR.find((d) => d.id === FATIMAH[step]), true);
      } else {
        await celebrate({ key: 'praise.islamic', duration: 2400, speak: false });
        if (!alive) return;
        step = 0;
        select(mode === 'fatimah' ? DHIKR[0] : current, false);
      }
      busy = false;
    }

    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (busy) return;
      count += 1;
      taps += 1;
      sound.bead();
      if (navigator.vibrate) navigator.vibrate(10);
      pad.classList.remove('tick');
      void pad.offsetWidth;
      pad.classList.add('tick');
      paint();
      if (count >= current.target) complete();
    });
    pad.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pad.dispatchEvent(new PointerEvent('pointerdown'));
      }
    });

    const reset = button({ label: t('tasbeeh.reset'), iconName: 'refresh', kind: 'secondary', size: 'small', onTap: () => { step = 0; select(mode === 'fatimah' ? DHIKR[0] : current, false); } });

    root.append(
      chips,
      h('div', { class: 'tasbeeh-main' },
        pad,
        h('div', { class: 'tasbeeh-words' }, arEl, trEl, meaningEl, h('p', { class: 'tasbeeh-hint' }, t('tasbeeh.intro')), reset)),
    );
    renderChips();
    select(DHIKR[0], false);
    ctx.setRepeat(() => speakDhikr(current));
    say('tasbeeh.intro');
    return () => { alive = false; };
  },
};
