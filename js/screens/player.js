// Plays one song after another, like a radio. Built-in songs come from YouTube;
// songs the family recorded or uploaded play from this device.
import { t, lang } from '../core/i18n.js';
import { say, sayText } from '../core/speech.js';
import { h, iconButton, button, tap } from '../core/ui.js';
import { icon } from '../core/art.js';
import { blobURL, keepAwake } from '../core/media.js';
import { sound } from '../core/sound.js';
import { songsFor, songTitle, songMeta, coverArt, lyricsFor, loadYouTubeAPI, localized, normalizeCat, catTitleKey } from '../core/music.js';

export default {
  title: (params) => t(catTitleKey(normalizeCat(params.cat))),
  back: (params) => `/music/${normalizeCat(params.cat)}`,
  tone: 'sky',
  screenClass: 'player-screen',
  async mount(root, params, ctx) {
    const cat = normalizeCat(params.cat);
    document.getElementById('app').dataset.tone = cat === 'naats' ? 'sage' : 'sky';
    const list = await songsFor(cat);
    if (!ctx.isCurrent()) return;
    if (!list.length) return;

    let index = Math.max(0, list.findIndex((s) => String(s.id) === params.id));
    let alive = true;
    let yt = null;
    let ytReady = false;
    let pendingVideo = null;
    let attempt = 0;
    let failures = 0;
    let playing = false;
    let restTimer = 0;
    let nudgeTimer = 0;
    let lyricIndex = 0;
    let showWords = cat === 'words';
    const audio = new Audio();
    audio.preload = 'auto';

    /* ---------- Layout ---------- */
    const ytWrap = h('div', { class: 'yt-wrap' });
    const disc = h('div', { class: 'player-disc' });
    const loadingEl = h('p', { class: 'player-loading' }, t('common.loading'));
    const note = h('div', { class: 'player-note', hidden: true });
    const lyricsPanel = h('div', { class: 'lyrics', hidden: true });
    const media = h('div', { class: 'player-media' }, disc, loadingEl, ytWrap, lyricsPanel, note);

    const titleEl = h('h2', { class: 'player-title' });
    const metaEl = h('p', { class: 'player-meta' });
    const playBtn = iconButton({ iconName: 'play', label: t('common.play'), kind: 'primary', cls: 'btn-xl play-toggle', onTap: togglePlay });
    const prevBtn = iconButton({ iconName: 'prev', label: t('common.previous'), onTap: () => { sound.tap(); load(index - 1); } });
    const nextBtn = iconButton({ iconName: 'next', label: t('common.next'), onTap: () => { sound.tap(); load(index + 1); } });
    const wordsBtn = button({ label: t('music.words'), iconName: 'lyrics', kind: 'secondary', onTap: () => toggleWords() });
    const upNext = h('p', { class: 'player-upnext' });

    root.append(h('div', { class: `player ${cat}` },
      media,
      h('div', { class: 'player-info' },
        titleEl,
        metaEl,
        h('div', { class: 'player-controls' }, prevBtn, playBtn, nextBtn),
        h('div', { class: 'player-extra' }, wordsBtn),
        upNext)));

    ctx.setRepeat(() => sayText(songTitle(list[index])));

    /* ---------- State ---------- */
    function setPlaying(value) {
      playing = value;
      media.classList.toggle('playing', value);
      playBtn.innerHTML = icon(value ? 'pause' : 'play');
      playBtn.setAttribute('aria-label', value ? t('common.pause') : t('common.play'));
      keepAwake(value);
      if (value) {
        failures = 0;
        clearTimeout(nudgeTimer);
        playBtn.classList.remove('nudge');
      }
    }

    function showNote(text, kind = '') {
      note.hidden = false;
      note.className = `player-note ${kind}`;
      note.replaceChildren(h('span', { class: 'player-note-icon', html: icon('music') }), h('span', null, text));
    }
    function hideNote() { note.hidden = true; }

    function paintInfo(song) {
      titleEl.textContent = songTitle(song);
      metaEl.textContent = song.family ? t('music.byFamily') : songMeta(song);
      disc.innerHTML = coverArt(song);
      const next = list[(index + 1) % list.length];
      upNext.replaceChildren(
        h('span', { class: 'upnext-label', html: icon('next') }),
        h('span', null, songTitle(next)));
      upNext.hidden = list.length < 2;
      prevBtn.disabled = list.length < 2;
      nextBtn.disabled = list.length < 2;
    }

    /* ---------- Loading ---------- */
    async function load(i) {
      clearTimeout(restTimer);
      clearTimeout(nudgeTimer);
      index = (i + list.length) % list.length;
      const song = list[index];
      history.replaceState(null, '', `#/play/${cat}/${encodeURIComponent(song.id)}`);
      attempt = 0;
      setPlaying(false);
      hideNote();
      paintInfo(song);
      setupWords(song);
      if (song.blob) {
        stopVideo();
        playFile(song);
        return;
      }
      audio.pause();
      media.classList.add('video');
      media.classList.remove('audio');
      const ids = song.yt || [];
      if (!ids.length) { resting(); return; }
      if (navigator.onLine === false) { offline(); return; }
      await playVideo(ids[0]);
      nudgeTimer = setTimeout(() => { if (alive && !playing) playBtn.classList.add('nudge'); }, 7000);
    }

    function playFile(song) {
      media.classList.remove('video');
      media.classList.add('audio');
      audio.src = blobURL(song.blob);
      audio.play().then(() => setPlaying(true)).catch(() => { setPlaying(false); playBtn.classList.add('nudge'); });
    }

    async function playVideo(videoId) {
      if (yt && ytReady) {
        yt.loadVideoById(videoId);
        return;
      }
      pendingVideo = videoId;
      if (yt) return;
      media.classList.add('yt-loading');
      let YT;
      try {
        YT = await loadYouTubeAPI();
      } catch {
        if (alive) offline();
        return;
      }
      if (!alive) return;
      const host = h('div', { class: 'yt-host' });
      ytWrap.replaceChildren(host);
      yt = new YT.Player(host, {
        host: 'https://www.youtube-nocookie.com',
        videoId: pendingVideo,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, fs: 0, origin: location.origin },
        events: {
          onReady: () => {
            ytReady = true;
            media.classList.remove('yt-loading');
            if (pendingVideo && yt.getVideoData && yt.getVideoData().video_id !== pendingVideo) yt.loadVideoById(pendingVideo);
            try { yt.playVideo(); } catch { /* the user can press play */ }
          },
          onStateChange: (e) => {
            if (!alive) return;
            if (e.data === 1) { hideNote(); setPlaying(true); }
            else if (e.data === 2) setPlaying(false);
            else if (e.data === 0) { setPlaying(false); load(index + 1); }
          },
          onError: () => {
            if (!alive) return;
            const ids = list[index].yt || [];
            attempt += 1;
            if (attempt < ids.length) yt.loadVideoById(ids[attempt]);
            else resting();
          },
        },
      });
    }

    function stopVideo() {
      if (yt && ytReady) {
        try { yt.stopVideo(); } catch { /* ignore */ }
      }
    }

    /* A song that can't play right now: say so kindly and move on. */
    function resting() {
      setPlaying(false);
      failures += 1;
      if (failures >= 3) { offline(); return; }
      showNote(t('music.resting'));
      say('music.resting');
      restTimer = setTimeout(() => { if (alive) load(index + 1); }, 4500);
    }

    function offline() {
      setPlaying(false);
      media.classList.remove('yt-loading');
      showNote(t('music.offline'), 'offline');
      say('music.offline');
    }

    function togglePlay() {
      const song = list[index];
      playBtn.classList.remove('nudge');
      if (song.blob) {
        if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
        else { audio.pause(); setPlaying(false); }
        return;
      }
      if (!yt || !ytReady) { load(index); return; }
      if (playing) yt.pauseVideo();
      else yt.playVideo();
    }

    audio.addEventListener('ended', () => { setPlaying(false); load(index + 1); });
    audio.addEventListener('pause', () => setPlaying(false));
    audio.addEventListener('play', () => setPlaying(true));
    audio.addEventListener('error', () => { if (list[index].blob) resting(); });

    /* ---------- Words to sing along ---------- */
    function lineParts(line, script) {
      const code = lang();
      const origClass = script === 'ar' ? 'ar' : 'ur-text';
      const origLang = script === 'ar' ? 'ar' : 'ur';
      if (code === 'ur') return [h('span', { class: `ly-main ${origClass}`, lang: origLang }, line.orig)];
      const parts = [];
      if (script === 'ar') parts.push(h('span', { class: 'ly-orig ar', lang: 'ar' }, line.orig));
      parts.push(code === 'hi'
        ? h('span', { class: 'ly-main deva', lang: 'hi' }, line.hi)
        : h('span', { class: 'ly-main latin' }, line.rom));
      return parts;
    }

    function setupWords(song) {
      const words = lyricsFor(song);
      wordsBtn.hidden = !words;
      if (!words) {
        showWords = false;
        lyricsPanel.hidden = true;
        media.classList.remove('words');
        return;
      }
      lyricIndex = 0;
      const lines = h('ol', { class: 'lyric-lines' },
        words.lines.map((line, i) => {
          const li = h('li', { class: 'lyric-line', dataset: { i: String(i) } }, lineParts(line, words.script));
          tap(li, () => setLine(i));
          return li;
        }));
      lyricsPanel.replaceChildren(
        h('p', { class: 'lyrics-poet' }, t('music.poet', { name: localized(words.poet) })),
        lines,
        h('div', { class: 'lyrics-nav' },
          iconButton({ iconName: 'up', label: t('music.linePrev'), onTap: () => setLine(lyricIndex - 1) }),
          button({ label: t('music.lineNext'), iconName: 'down', kind: 'primary', onTap: () => setLine(lyricIndex + 1) })));
      setLine(0, false);
      lyricsPanel.hidden = !showWords;
      media.classList.toggle('words', showWords);
      syncWordsButton();
    }

    function setLine(i, scroll = true) {
      const items = lyricsPanel.querySelectorAll('.lyric-line');
      if (!items.length) return;
      lyricIndex = Math.max(0, Math.min(items.length - 1, i));
      items.forEach((el, k) => {
        el.classList.toggle('now', k === lyricIndex);
        el.classList.toggle('past', k < lyricIndex);
      });
      if (scroll) items[lyricIndex].scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    function syncWordsButton() {
      wordsBtn.querySelector('.btn-label').textContent = showWords ? t('music.hideWords') : t('music.words');
      const svgIcon = wordsBtn.querySelector('svg');
      if (svgIcon) svgIcon.outerHTML = icon(showWords ? 'music' : 'lyrics');
    }

    function toggleWords() {
      showWords = !showWords;
      lyricsPanel.hidden = !showWords;
      media.classList.toggle('words', showWords);
      syncWordsButton();
      if (showWords) setLine(lyricIndex);
    }

    load(index);

    return () => {
      alive = false;
      clearTimeout(restTimer);
      clearTimeout(nudgeTimer);
      audio.pause();
      audio.removeAttribute('src');
      if (yt && yt.destroy) {
        try { yt.destroy(); } catch { /* ignore */ }
      }
      keepAwake(false);
    };
  },
};
