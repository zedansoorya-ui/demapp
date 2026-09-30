import { t } from '../core/i18n.js';
import { h, button, iconButton } from '../core/ui.js';
import { getPeople, introduce } from '../core/family.js';
import { navigate } from '../core/router.js';
import { sound } from '../core/sound.js';
import { personPhoto } from './family.js';

export default {
  title: 'family.title',
  back: '/family',
  tone: 'clay',
  screenClass: 'person-screen',
  async mount(root, params, ctx) {
    const people = await getPeople();
    if (!ctx.isCurrent()) return;
    if (!people.length) {
      navigate('/family', { replace: true });
      return;
    }
    let index = Math.max(0, people.findIndex((p) => p.id === params.id));
    const stage = h('div', { class: 'person-stage' });

    function show(i, dir = 0) {
      index = (i + people.length) % people.length;
      const person = people[index];
      history.replaceState(null, '', `#/family/${encodeURIComponent(person.id)}`);
      const card = h('figure', { class: `person-view${dir > 0 ? ' from-next' : dir < 0 ? ' from-prev' : ''}` },
        h('div', { class: 'person-view-photo' }, personPhoto(person, 'kb-slow')),
        h('figcaption', { class: 'person-view-caption' },
          h('span', { class: 'person-view-name' }, person.name),
          person.relation ? h('span', { class: 'person-view-rel' }, person.relation) : null));
      stage.replaceChildren(card);
      introduce(person);
    }

    const many = people.length > 1;
    const controls = h('div', { class: 'person-controls' },
      many ? iconButton({ iconName: 'arrowBack', label: t('common.previous'), onTap: () => { sound.swap(); show(index - 1, -1); } }) : null,
      button({ label: t('common.repeat'), iconName: 'speaker', kind: 'primary', onTap: () => introduce(people[index]) }),
      many ? iconButton({ iconName: 'arrowForward', label: t('common.next'), onTap: () => { sound.swap(); show(index + 1, 1); } }) : null);

    // Swipe to move between people; a plain touch says the name again.
    let startX = null;
    stage.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    stage.addEventListener('pointerup', (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 70 && many) {
        const rtl = document.documentElement.dir === 'rtl';
        const forward = rtl ? dx > 0 : dx < 0;
        sound.swap();
        show(index + (forward ? 1 : -1), forward ? 1 : -1);
      } else if (Math.abs(dx) < 12) {
        introduce(people[index]);
      }
    });

    root.append(stage, controls);
    ctx.setRepeat(() => introduce(people[index]));
    show(index);
  },
};
