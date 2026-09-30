// Picture puzzle: touch one piece, then another, and they swap places.
import { t } from '../core/i18n.js';
import { say, sayText } from '../core/speech.js';
import { h, button, celebrate, instruction, shuffle, tap } from '../core/ui.js';
import { getPeople } from '../core/family.js';
import { blobURL } from '../core/media.js';
import { sound } from '../core/sound.js';
import { PAGES, pageSVG } from '../data/pages.js';

let pieces = 2;

async function squarePhoto(blob) {
  const img = new Image();
  img.src = blobURL(blob);
  await img.decode();
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 900;
  canvas.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 900, 900);
  const out = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  return URL.createObjectURL(out);
}

const svgURL = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export default {
  title: 'puzzle.title',
  back: '/games',
  tone: 'sky',
  screenClass: 'puzzle-screen',
  async mount(root, _params, ctx) {
    const people = await getPeople({ withPhoto: true });
    if (!ctx.isCurrent()) return;
    let alive = true;
    const madeURLs = [];

    const pictures = [
      ...people.map((p) => ({ key: `p-${p.id}`, label: p.name, thumb: blobURL(p.photo), load: () => squarePhoto(p.photo), speak: () => sayText(p.name) })),
      ...PAGES.map((pg) => {
        const url = svgURL(pageSVG(pg, null, { usePreset: true }));
        return { key: pg.id, label: t(pg.nameKey), thumb: url, load: async () => url, speak: () => say(pg.nameKey) };
      }),
    ];

    function showPicker() {
      root.replaceChildren();
      const seg = h('div', { class: 'segmented', role: 'group' },
        [[2, 'puzzle.easy'], [3, 'puzzle.harder']].map(([n, key]) => {
          const b = h('button', { type: 'button', 'aria-pressed': String(pieces === n) }, t(key));
          tap(b, () => {
            pieces = n;
            seg.querySelectorAll('button').forEach((el) => el.setAttribute('aria-pressed', String(el === b)));
            sound.tap();
          });
          return b;
        }));
      const grid = h('div', { class: 'page-grid stagger' },
        pictures.map((pic, i) => {
          const card = h('button', { type: 'button', class: 'page-card', style: `--i:${Math.min(i, 12)}` },
            h('span', { class: 'page-thumb' }, h('img', { src: pic.thumb, alt: '', class: 'thumb-img' })),
            h('span', { class: 'page-name' }, pic.label));
          tap(card, () => { sound.tap(); pic.speak(); start(pic); });
          return card;
        }));
      root.append(h('div', { class: 'puzzle-head' }, instruction('puzzle.pick'), seg), grid);
      ctx.setRepeat(() => say('puzzle.pick'));
    }

    async function start(pic) {
      const url = await pic.load();
      if (!alive) return;
      if (url.startsWith('blob:')) madeURLs.push(url);
      const n = pieces;
      const count = n * n;
      let pos = Array.from({ length: count }, (_, i) => i);
      const minWrong = Math.ceil(count / 2);
      do { pos = shuffle(pos); } while (pos.filter((p, i) => p !== i).length < minWrong);
      let selected = null;
      let solved = false;

      root.replaceChildren();
      const board = h('div', { class: `puzzle-board n${n}` });
      const tiles = [];
      const place = (i) => {
        const p = pos[i];
        tiles[i].style.setProperty('--x', String(p % n));
        tiles[i].style.setProperty('--y', String(Math.floor(p / n)));
        tiles[i].classList.toggle('placed', p === i);
      };
      for (let i = 0; i < count; i += 1) {
        const tile = h('button', {
          type: 'button',
          class: 'piece',
          style: {
            backgroundImage: `url("${url}")`,
            backgroundSize: `${n * 100}% ${n * 100}%`,
            backgroundPosition: `${(i % n) * (100 / (n - 1))}% ${Math.floor(i / n) * (100 / (n - 1))}%`,
          },
        });
        tiles.push(tile);
        tap(tile, () => choose(i), { debounce: 200 });
        board.append(tile);
      }
      tiles.forEach((_, i) => place(i));

      async function choose(i) {
        if (solved) return;
        if (selected === null) {
          selected = i;
          tiles[i].classList.add('lifted');
          sound.select();
          return;
        }
        if (selected === i) {
          tiles[i].classList.remove('lifted');
          selected = null;
          return;
        }
        const a = selected;
        selected = null;
        tiles[a].classList.remove('lifted');
        [pos[a], pos[i]] = [pos[i], pos[a]];
        place(a);
        place(i);
        sound.swap();
        if (pos.every((p, k) => p === k)) {
          solved = true;
          setTimeout(async () => {
            if (!alive) return;
            board.classList.add('solved');
            await celebrate({ key: 'puzzle.done', duration: 2600 });
            if (alive) again.hidden = false;
          }, 450);
        }
      }

      const again = h('div', { class: 'puzzle-after', hidden: true },
        button({ label: t('common.again'), iconName: 'refresh', kind: 'secondary', onTap: () => start(pic) }),
        button({ label: t('puzzle.pick'), iconName: 'image', kind: 'clay', onTap: showPicker }));

      root.append(
        instruction('puzzle.intro'),
        h('div', { class: 'puzzle-play' },
          board,
          h('div', { class: 'puzzle-ref' }, h('img', { src: url, alt: pic.label }), h('span', null, pic.label))),
        again,
      );
      ctx.setRepeat(() => say('puzzle.intro'));
      say('puzzle.intro');
    }

    showPicker();
    say('puzzle.pick');
    return () => {
      alive = false;
      madeURLs.forEach((u) => URL.revokeObjectURL(u));
    };
  },
};
