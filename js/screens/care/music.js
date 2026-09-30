import { settings } from '../../core/store.js';
import { t } from '../../core/i18n.js';
import { h, button, tap } from '../../core/ui.js';
import { navigate } from '../../core/router.js';
import { sound } from '../../core/sound.js';
import { songsFor, songTitle, songMeta, coverArt } from '../../core/music.js';
import { CATALOG } from '../../data/catalog.js';
import { section } from './widgets.js';

export default {
  title: 'care.music',
  back: '/care',
  mode: 'care',
  tone: 'care',
  async mount(root, _params, ctx) {
    const family = [...await songsFor('songs', { includeHidden: true }), ...await songsFor('naats', { includeHidden: true })].filter((s) => s.family);
    if (!ctx.isCurrent()) return;

    const familyList = h('div', { class: 'care-list' });
    if (!family.length) familyList.append(h('p', { class: 'care-empty' }, t('music.empty')));
    family.forEach((song) => {
      const row = h('button', { type: 'button', class: 'care-item-main' },
        h('span', { class: 'care-thumb round', html: coverArt(song) }),
        h('span', { class: 'care-item-text' },
          h('span', { class: 'care-item-title' }, songTitle(song)),
          h('span', { class: 'care-item-sub' }, [song.artist, t(song.cat === 'naats' ? 'music.naats' : 'music.songs')].filter(Boolean).join(' · '))));
      tap(row, () => { sound.tap(); navigate(`/care/music/${encodeURIComponent(song.id)}`); });
      familyList.append(h('div', { class: 'care-item' }, row));
    });

    const hidden = new Set(settings.get().hiddenSongs || []);
    const builtIn = (cat) => h('div', { class: 'care-list' },
      CATALOG.filter((s) => s.cat === cat).map((song) => {
        const toggle = h('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(!hidden.has(song.id)), 'aria-label': songTitle(song) });
        tap(toggle, () => {
          const show = toggle.getAttribute('aria-checked') !== 'true';
          toggle.setAttribute('aria-checked', String(show));
          if (show) hidden.delete(song.id); else hidden.add(song.id);
          settings.set({ hiddenSongs: [...hidden] });
          sound.tap();
        }, { debounce: 250 });
        return h('div', { class: 'care-item' },
          h('div', { class: 'care-item-main static' },
            h('span', { class: 'care-thumb round', html: coverArt(song) }),
            h('span', { class: 'care-item-text' },
              h('span', { class: 'care-item-title' }, songTitle(song)),
              h('span', { class: 'care-item-sub' }, songMeta(song)))),
          h('div', { class: 'care-item-tools' }, toggle));
      }));

    root.append(
      h('p', { class: 'care-intro' }, t('care.musicIntro')),
      h('div', { class: 'care-actions' },
        button({ label: t('care.addSong'), iconName: 'plus', kind: 'clay', onTap: () => navigate('/care/music/new') })),
      section(t('care.familySongs'), familyList),
      section(`${t('care.builtIn')} · ${t('music.songs')}`, builtIn('songs')),
      section(`${t('care.builtIn')} · ${t('music.naats')}`, builtIn('naats')),
    );
  },
};
