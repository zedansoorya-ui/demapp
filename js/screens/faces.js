// "Who is this?" — hear a loved one's name (in their own voice when recorded),
// then touch their photo. There is no wrong answer: touching someone else tells
// you who that is, and after two tries the right photo gently glows.
import { settings } from '../core/store.js';
import { t } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { h, button, celebrate, emptyState, shuffle, tap, wait } from '../core/ui.js';
import { getPeople, callName, introduce } from '../core/family.js';
import { navigate } from '../core/router.js';
import { sound } from '../core/sound.js';
import { sparkleAt } from '../core/motion.js';
import { icon } from '../core/art.js';
import { personPhoto } from './family.js';

export default {
  title: 'faces.title',
  back: (_params, from) => (from && from.startsWith('/family') ? '/family' : '/games'),
  tone: 'sage',
  screenClass: 'faces-screen',
  async mount(root, _params, ctx) {
    const people = await getPeople({ withPhoto: true });
    if (!ctx.isCurrent()) return;

    if (people.length < 2) {
      root.append(emptyState({
        artName: 'faces',
        title: t('faces.needMore'),
        action: button({ label: t('family.title'), iconName: 'people', kind: 'primary', onTap: () => navigate('/family') }),
      }));
      say('faces.needMore');
      return;
    }

    const promptText = h('span', { class: 'faces-prompt-text' });
    const promptBtn = h('button', { type: 'button', class: 'faces-prompt' },
      h('span', { class: 'faces-prompt-icon', html: icon('speaker') }), promptText);
    const board = h('div', { class: 'faces-board' });
    root.append(promptBtn, board);

    let target = null;
    let lastTarget = null;
    let tries = 0;
    let locked = false;
    let alive = true;

    const ask = () => callName(target);
    tap(promptBtn, ask);
    ctx.setRepeat(ask);

    async function round() {
      const choices = Math.min(settings.get().faceChoices || 2, people.length, 4);
      const pool = people.length > 2 && lastTarget ? people.filter((p) => p.id !== lastTarget.id) : people;
      target = pool[Math.floor(Math.random() * pool.length)];
      lastTarget = target;
      const others = shuffle(people.filter((p) => p.id !== target.id)).slice(0, choices - 1);
      const options = shuffle([target, ...others]);
      tries = 0;
      locked = false;
      promptText.textContent = t('faces.where', { name: target.name });
      board.className = `faces-board n-${options.length}`;
      board.replaceChildren(...options.map((person, i) => {
        const card = h('button', { type: 'button', class: 'face-card', style: `--i:${i}`, 'aria-label': person.id === target.id ? t('faces.where', { name: person.name }) : '' },
          h('span', { class: 'face-photo' }, personPhoto(person)),
          h('span', { class: 'face-name' }, person.name),
          h('span', { class: 'face-tick', html: icon('check') }));
        card.dataset.target = String(person.id === target.id);
        tap(card, (e) => choose(card, person, e));
        return card;
      }));
      await wait(250);
      if (alive) ask();
    }

    async function choose(card, person, e) {
      if (locked) return;
      if (person.id === target.id) {
        locked = true;
        card.classList.add('right');
        board.classList.add('solved');
        sparkleAt(e.clientX, e.clientY);
        await celebrate({ key: 'faces.yes', vars: { name: person.name }, duration: 2600, placement: 'bottom' });
        if (!alive) return;
        if (person.voice) await introduce(person);
        if (alive) round();
        return;
      }
      // Not them — say who it is, kindly, then ask again.
      tries += 1;
      sound.soft();
      card.classList.add('named');
      await say('family.thisIs', { name: person.name });
      if (!alive || locked) return;
      if (tries >= 2) {
        const right = board.querySelector('[data-target="true"]');
        if (right) right.classList.add('hint');
      }
      ask();
    }

    round();
    return () => { alive = false; };
  },
};
