import { t } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { db } from '../core/store.js';
import { h, instruction, tap } from '../core/ui.js';
import { icon } from '../core/art.js';
import { navigate } from '../core/router.js';
import { sound } from '../core/sound.js';
import { PAGES, pageSVG } from '../data/pages.js';

export default {
  title: 'coloring.title',
  back: '/games',
  tone: 'clay',
  async mount(root, _params, ctx) {
    const saved = new Map((await db.all('art')).map((a) => [a.id, a]));
    if (!ctx.isCurrent()) return;
    const grid = h('div', { class: 'page-grid stagger' });
    PAGES.forEach((page, i) => {
      const art = saved.get(page.id);
      const card = h('button', { type: 'button', class: 'page-card', style: `--i:${i}` },
        h('span', { class: 'page-thumb', html: pageSVG(page, art && art.fills, { strokeWidth: 7 }) }),
        h('span', { class: 'page-name' }, t(page.nameKey)),
        art && art.done ? h('span', { class: 'page-done', html: icon('star') }) : null);
      tap(card, () => {
        sound.tap();
        say(page.nameKey);
        navigate(`/coloring/${page.id}`);
      });
      grid.append(card);
    });
    root.append(instruction('coloring.pick'), grid);
    ctx.setRepeat(() => say('coloring.pick'));
    say('coloring.pick');
  },
};
