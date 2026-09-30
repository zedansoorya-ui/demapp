// Slow breathing: in for 4 seconds, out for 6. Spoken guidance for the first
// few breaths, then just the circle and a soft sound.
import { t } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { h, instruction } from '../core/ui.js';
import { sound } from '../core/sound.js';

const IN = 4000;
const HOLD = 1000;
const OUT = 6000;
const REST = 700;

export default {
  title: 'breathe.title',
  tone: 'lilac',
  screenClass: 'breathe-screen',
  mount(root, _params, ctx) {
    const word = h('span', { class: 'breath-word' });
    const circle = h('div', { class: 'breath' },
      h('span', { class: 'breath-ring r1' }),
      h('span', { class: 'breath-ring r2' }),
      h('span', { class: 'breath-ring r3' }),
      h('span', { class: 'breath-core' }),
      word);
    root.append(instruction('breathe.intro'), h('div', { class: 'breath-stage' }, circle));

    let alive = true;
    let cycle = 0;
    let timer = 0;

    function inhale() {
      if (!alive) return;
      circle.classList.remove('out');
      circle.classList.add('in');
      word.textContent = t('breathe.in');
      if (cycle < 3) say('breathe.in');
      sound.whoosh(IN / 1000, true);
      timer = setTimeout(() => { timer = setTimeout(exhale, HOLD); }, IN);
    }
    function exhale() {
      if (!alive) return;
      circle.classList.remove('in');
      circle.classList.add('out');
      word.textContent = t('breathe.out');
      if (cycle < 3) say('breathe.out');
      sound.whoosh(OUT / 1000, false);
      cycle += 1;
      timer = setTimeout(inhale, OUT + REST);
    }

    circle.classList.add('out');
    ctx.setRepeat(() => say('breathe.intro'));
    say('breathe.intro').then(() => { if (alive) timer = setTimeout(inhale, 600); });

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  },
};
