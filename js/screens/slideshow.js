// Photo frame: family photos drift slowly, one after another.
// From the family screen it also says each name; as the idle "photo frame" it stays quiet
// and any touch goes back home.
import { h, shuffle, tap } from '../core/ui.js';
import { getPeople, introduce } from '../core/family.js';
import { blobURL, keepAwake } from '../core/media.js';
import { navigate } from '../core/router.js';

export default {
  title: 'family.slideshow',
  back: '/family',
  tone: 'clay',
  screenClass: 'slideshow-screen',
  async mount(root, _params, ctx) {
    const idle = /[?&]idle=1/.test(location.hash);
    const people = await getPeople({ withPhoto: true });
    if (!ctx.isCurrent()) return;
    if (!people.length) {
      navigate(idle ? '/' : '/family', { replace: true });
      return;
    }
    const app = document.getElementById('app');
    if (idle) app.classList.add('immersive');

    const frame = h('div', { class: 'slides', role: 'img' });
    root.append(frame);
    keepAwake(true);

    let order = shuffle(people);
    let n = 0;
    let timer = 0;
    let currentPerson = null;

    function next() {
      if (n > 0 && n % order.length === 0) order = shuffle(people);
      const person = order[n % order.length];
      currentPerson = person;
      n += 1;
      const slide = h('figure', { class: 'slide' },
        h('div', { class: 'slide-bg', style: { backgroundImage: `url("${blobURL(person.photo)}")` } }),
        h('img', { class: `slide-img kb-${n % 4}`, src: blobURL(person.photo), alt: person.name }),
        h('figcaption', { class: 'slide-caption' },
          h('span', { class: 'slide-name' }, person.name),
          person.relation ? h('span', { class: 'slide-rel' }, person.relation) : null));
      frame.append(slide);
      requestAnimationFrame(() => requestAnimationFrame(() => slide.classList.add('in')));
      const old = Array.from(frame.children).slice(0, -1);
      setTimeout(() => old.forEach((el) => el.remove()), 1800);
      if (!idle) introduce(person);
      timer = setTimeout(next, idle ? 9000 : 8000);
    }

    if (idle) {
      root.addEventListener('pointerdown', () => navigate('/'), { once: true });
    } else {
      tap(frame, () => introduce(currentPerson));
      ctx.setRepeat(() => introduce(currentPerson));
    }
    next();

    return () => {
      clearTimeout(timer);
      keepAwake(false);
      app.classList.remove('immersive');
    };
  },
};
