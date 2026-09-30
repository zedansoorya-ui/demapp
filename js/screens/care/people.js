import { t } from '../../core/i18n.js';
import { db } from '../../core/store.js';
import { h, button, iconButton, tap } from '../../core/ui.js';
import { icon } from '../../core/art.js';
import { getPeople } from '../../core/family.js';
import { blobURL } from '../../core/media.js';
import { navigate } from '../../core/router.js';
import { sound } from '../../core/sound.js';

export default {
  title: 'care.people',
  back: '/care',
  mode: 'care',
  tone: 'care',
  async mount(root, _params, ctx) {
    const list = h('div', { class: 'care-list' });
    root.append(
      h('p', { class: 'care-intro' }, t('care.peopleIntro')),
      h('div', { class: 'care-actions' },
        button({ label: t('care.addPerson'), iconName: 'plus', kind: 'clay', onTap: () => navigate('/care/people/new') })),
      list,
    );

    async function render() {
      const people = await getPeople();
      if (!ctx.isCurrent()) return;
      if (!people.length) {
        list.replaceChildren(h('p', { class: 'care-empty' }, t('care.noPeople')));
        return;
      }
      list.replaceChildren(...people.map((p, i) => {
        const open = h('button', { type: 'button', class: 'care-item-main' },
          h('span', { class: 'care-thumb' }, p.photo ? h('img', { src: blobURL(p.photo), alt: '' }) : h('span', { html: icon('people') })),
          h('span', { class: 'care-item-text' },
            h('span', { class: 'care-item-title' }, p.name),
            h('span', { class: 'care-item-sub' },
              p.relation || '',
              h('span', { class: `voice-flag${p.voice ? ' has' : ''}`, html: icon(p.voice ? 'mic' : 'speaker') }))));
        tap(open, () => { sound.tap(); navigate(`/care/people/${encodeURIComponent(p.id)}`); });
        const move = async (dir) => {
          const j = i + dir;
          if (j < 0 || j >= people.length) return;
          const reordered = people.slice();
          [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
          await Promise.all(reordered.map((person, k) => db.put('people', { ...person, order: k })));
          sound.swap();
          render();
        };
        return h('div', { class: 'care-item' },
          open,
          h('div', { class: 'care-item-tools' },
            iconButton({ iconName: 'up', label: t('care.moveUp'), size: 'small', onTap: () => move(-1) }),
            iconButton({ iconName: 'down', label: t('care.moveDown'), size: 'small', onTap: () => move(1) })));
      }));
    }
    render();
  },
};
