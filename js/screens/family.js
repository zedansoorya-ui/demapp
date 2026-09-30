import { t } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { h, button, emptyState, holdButton, instruction, tap } from '../core/ui.js';
import { getPeople } from '../core/family.js';
import { blobURL } from '../core/media.js';
import { navigate, unlockCare } from '../core/router.js';
import { sound } from '../core/sound.js';

export function personPhoto(person, cls = '') {
  if (person.photo) {
    return h('img', { class: cls, src: blobURL(person.photo), alt: '', decoding: 'async', draggable: 'false' });
  }
  return h('span', { class: `person-initial ${cls}` }, (person.name || '?').trim().slice(0, 1).toUpperCase());
}

export default {
  title: 'family.title',
  tone: 'clay',
  async mount(root, _params, ctx) {
    const people = await getPeople();
    if (!ctx.isCurrent()) return;

    if (!people.length) {
      root.append(emptyState({
        artName: 'family',
        title: t('family.empty'),
        text: t('family.emptyHint'),
        action: holdButton({
          label: t('home.care'),
          hint: t('home.holdHint'),
          onDone: () => { unlockCare(); navigate('/care/people/new'); },
        }),
      }));
      ctx.setRepeat(() => say('family.empty'));
      say('family.empty');
      return;
    }

    const withPhotos = people.filter((p) => p.photo);
    const grid = h('div', { class: `people-grid stagger count-${Math.min(people.length, 6)}` });
    people.forEach((person, i) => {
      const card = h('button', { type: 'button', class: 'person-card', style: `--i:${i}`, 'aria-label': person.name },
        h('span', { class: 'person-photo' }, personPhoto(person)),
        h('span', { class: 'person-name' }, person.name),
        person.relation ? h('span', { class: 'person-rel' }, person.relation) : null);
      tap(card, () => {
        sound.tap();
        navigate(`/family/${encodeURIComponent(person.id)}`);
      });
      grid.append(card);
    });

    const actions = h('div', { class: 'family-actions' });
    if (withPhotos.length >= 2) {
      actions.append(button({ label: t('family.whoIsThis'), iconName: 'sparkle', kind: 'clay', onTap: () => navigate('/faces') }));
    }
    if (withPhotos.length) {
      actions.append(button({ label: t('family.slideshow'), iconName: 'image', kind: 'secondary', onTap: () => navigate('/slideshow') }));
    }

    root.append(instruction('family.tapPhoto'), grid, actions);
    ctx.setRepeat(() => say('family.tapPhoto'));
    say('family.tapPhoto');
  },
};
