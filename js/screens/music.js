import { t } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { h, append, button, emptyState, instruction, tap } from '../core/ui.js';
import { icon } from '../core/art.js';
import { navigate } from '../core/router.js';
import { sound } from '../core/sound.js';
import { songsFor, songTitle, songMeta, coverArt, lyricsFor, normalizeCat, catTitleKey } from '../core/music.js';

export default {
  title: (params) => t(catTitleKey(normalizeCat(params.cat))),
  back: (params) => (normalizeCat(params.cat) === 'words' ? '/sing' : '/'),
  tone: 'sky',
  screenClass: 'music-screen',
  async mount(root, params, ctx) {
    const cat = normalizeCat(params.cat);
    document.getElementById('app').dataset.tone = cat === 'naats' ? 'sage' : 'sky';
    const list = await songsFor(cat);
    if (!ctx.isCurrent()) return;
    const hintKey = cat === 'naats' ? 'music.chooseNaat' : 'music.tapToPlay';
    ctx.setRepeat(() => say(hintKey));

    if (!list.length) {
      root.append(emptyState({ artName: cat === 'naats' ? 'naats' : 'songs', title: t('music.empty') }));
      say('music.empty');
      return;
    }

    const playAll = button({
      label: t('music.playAll'),
      iconName: 'play',
      kind: cat === 'naats' ? 'secondary' : 'clay',
      cls: 'play-all',
      onTap: () => {
        const start = list[Math.floor(Math.random() * list.length)];
        navigate(`/play/${cat}/${encodeURIComponent(start.id)}`);
      },
    });
    playAll.append(h('span', { class: 'eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')));

    const grid = h('div', { class: 'song-grid stagger' });
    list.forEach((song, i) => {
      const hasWords = !!lyricsFor(song);
      const card = h('button', { type: 'button', class: `song-card${song.family ? ' family' : ''}`, style: `--i:${Math.min(i, 14)}` },
        h('span', { class: `song-cover ${song.cat || cat}`, html: coverArt(song) }),
        h('span', { class: 'song-text' },
          h('span', { class: 'song-title' }, songTitle(song)),
          h('span', { class: 'song-meta' }, song.family ? t('music.byFamily') : songMeta(song))),
        hasWords ? h('span', { class: 'song-badge', title: t('music.words'), html: icon('lyrics') }) : null);
      tap(card, () => {
        sound.tap();
        navigate(`/play/${cat}/${encodeURIComponent(song.id)}`);
      });
      grid.append(card);
    });

    const offlineNote = navigator.onLine === false
      ? h('p', { class: 'music-offline' }, h('span', { html: icon('music') }), t('music.offline'))
      : null;

    append(root, [
      h('div', { class: 'music-head' }, instruction(hintKey), playAll),
      offlineNote,
      grid,
    ]);
    say(hintKey);
  },
};
