// Find the pairs. No timer, no score: cards that don't match simply turn back.
import { t } from '../core/i18n.js';
import { say, sayText } from '../core/speech.js';
import { h, button, celebrate, instruction, shuffle, tap, wait } from '../core/ui.js';
import { getPeople } from '../core/family.js';
import { blobURL } from '../core/media.js';
import { sound } from '../core/sound.js';
import { sparkleAt } from '../core/motion.js';
import { starPath, C } from '../core/art.js';
import { THINGS, thingArt } from '../data/things.js';

const LEVELS = [2, 3, 4, 6];
const BACK = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${starPath(50, 50, 22, 9, 8)}" fill="${C.clayTint}" opacity=".9"/><circle cx="50" cy="50" r="34" fill="none" stroke="${C.clayTint}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/></svg>`;

let level = 0;
let deckChoice = 'things';

export default {
  title: 'memory.title',
  back: '/games',
  tone: 'kraft',
  screenClass: 'memory-screen',
  async mount(root, _params, ctx) {
    const people = await getPeople({ withPhoto: true });
    if (!ctx.isCurrent()) return;
    const canUseFamily = people.length >= 2;
    if (!canUseFamily) deckChoice = 'things';

    const board = h('div', { class: 'memory-board' });
    const after = h('div', { class: 'memory-after', hidden: true });
    const deckSwitch = canUseFamily ? h('div', { class: 'segmented memory-deck', role: 'group' }) : null;
    let alive = true;

    function renderSwitch() {
      if (!deckSwitch) return;
      deckSwitch.replaceChildren(
        ...[['things', 'memory.pictures'], ['family', 'memory.family']].map(([value, key]) => {
          const b = h('button', { type: 'button', 'aria-pressed': String(deckChoice === value) }, t(key));
          tap(b, () => { deckChoice = value; renderSwitch(); deal(); });
          return b;
        }),
      );
    }

    function deckCards(pairs) {
      if (deckChoice === 'family' && canUseFamily) {
        const chosen = shuffle(people).slice(0, Math.min(pairs, people.length));
        return chosen.map((p) => ({ key: `p-${p.id}`, label: p.name, img: blobURL(p.photo), speak: () => sayText(p.name) }));
      }
      return shuffle(THINGS).slice(0, pairs).map((name) => ({ key: name, label: t(`thing.${name}`), art: thingArt(name), speak: () => say(`thing.${name}`) }));
    }

    let open = [];
    let matched = 0;
    let busy = false;

    function deal() {
      const pairs = LEVELS[level];
      const items = deckCards(pairs);
      const cards = shuffle([...items, ...items]);
      open = [];
      matched = 0;
      busy = false;
      after.hidden = true;
      board.className = `memory-board n-${cards.length}`;
      board.replaceChildren(...cards.map((item, i) => {
        const face = item.img
          ? h('span', { class: 'mem-face photo' }, h('img', { src: item.img, alt: '' }), h('span', { class: 'mem-label' }, item.label))
          : h('span', { class: 'mem-face' }, h('span', { class: 'mem-art', html: item.art }), h('span', { class: 'mem-label' }, item.label));
        const card = h('button', { type: 'button', class: 'mem-card', style: `--i:${i}`, 'aria-label': '?' },
          h('span', { class: 'mem-inner' },
            h('span', { class: 'mem-back', html: BACK }),
            face));
        card.dataset.key = item.key;
        tap(card, (e) => flip(card, item, e), { debounce: 250 });
        return card;
      }));
    }

    async function flip(card, item, e) {
      if (busy || card.classList.contains('up') || !alive) return;
      card.classList.add('up');
      card.setAttribute('aria-label', item.label);
      sound.flip();
      item.speak();
      open.push({ card, item });
      if (open.length < 2) return;
      busy = true;
      const [a, b] = open;
      open = [];
      if (a.item.key === b.item.key) {
        await wait(450);
        if (!alive) return;
        a.card.classList.add('matched');
        b.card.classList.add('matched');
        sound.chime();
        sparkleAt(e.clientX, e.clientY);
        matched += 1;
        busy = false;
        if (matched === LEVELS[level]) {
          await wait(500);
          if (!alive) return;
          await celebrate({ key: 'memory.done', duration: 2600 });
          if (alive) after.hidden = false;
        } else {
          say('memory.match');
        }
      } else {
        await wait(1400);
        if (!alive) return;
        sound.soft();
        [a, b].forEach(({ card: c }) => { c.classList.remove('up'); c.setAttribute('aria-label', '?'); });
        await wait(300);
        busy = false;
      }
    }

    after.append(
      button({ label: t('memory.same'), iconName: 'refresh', kind: 'secondary', onTap: () => deal() }),
      button({ label: t('memory.more'), iconName: 'plus', kind: 'clay', onTap: () => { level = Math.min(LEVELS.length - 1, level + 1); deal(); } }),
    );

    renderSwitch();
    const head = h('div', { class: 'memory-head' }, instruction('memory.intro'));
    if (deckSwitch) head.append(deckSwitch);
    root.append(head, board, after);
    deal();
    ctx.setRepeat(() => say('memory.intro'));
    say('memory.intro');
    return () => { alive = false; };
  },
};
