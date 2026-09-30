import { db, uid, requestPersistence } from '../../core/store.js';
import { t } from '../../core/i18n.js';
import { h, button, confirmSheet, toast } from '../../core/ui.js';
import { navigate } from '../../core/router.js';
import { sound } from '../../core/sound.js';
import { parseYouTubeId } from '../../core/music.js';
import { section, field, textInput, segmented, recorderWidget } from './widgets.js';

export default {
  title: 'care.editSong',
  back: '/care/music',
  mode: 'care',
  tone: 'care',
  async mount(root, params, ctx) {
    const isNew = params.id === 'new';
    const existing = isNew ? null : await db.get('songs', params.id);
    if (!ctx.isCurrent()) return;
    if (!isNew && !existing) {
      navigate('/care/music', { replace: true });
      return;
    }
    const draft = existing ? { ...existing } : {
      id: uid(), cat: 'songs', source: 'youtube', title: '', artist: '', yt: [], blob: null, createdAt: Date.now(),
    };
    let link = draft.yt && draft.yt[0] ? `https://youtu.be/${draft.yt[0]}` : '';

    const sourceArea = h('div', { class: 'song-source' });
    const preview = h('div', { class: 'yt-preview' });

    function paintPreview() {
      const id = parseYouTubeId(link);
      preview.replaceChildren(id ? h('img', { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: '' }) : '');
      preview.hidden = !id;
    }

    let recorder = null;
    function paintSource() {
      if (recorder) recorder.dispose();
      recorder = null;
      sourceArea.replaceChildren();
      if (draft.source === 'youtube') {
        const input = textInput({ value: link, placeholder: 'https://youtu.be/…', maxlength: 200, dir: 'ltr', onInput: (v) => { link = v; paintPreview(); } });
        input.type = 'url';
        sourceArea.append(field(t('care.youtubeLink'), input, t('care.youtubeHint')), preview);
        paintPreview();
      } else if (draft.source === 'file') {
        const fileInput = h('input', { type: 'file', accept: 'audio/*', class: 'visually-hidden', tabindex: '-1' });
        const chosen = h('p', { class: 'field-hint' }, draft.blob ? t('care.fileChosen', { name: draft.fileName || '♪' }) : '');
        fileInput.addEventListener('change', () => {
          const f = fileInput.files && fileInput.files[0];
          fileInput.value = '';
          if (!f) return;
          draft.blob = f;
          draft.fileName = f.name;
          if (!draft.title) {
            draft.title = f.name.replace(/\.[^.]+$/, '');
            titleInput.value = draft.title;
          }
          chosen.textContent = t('care.fileChosen', { name: f.name });
        });
        sourceArea.append(button({ label: t('care.chooseFile'), iconName: 'file', kind: 'secondary', onTap: () => fileInput.click() }), chosen, fileInput);
      } else {
        recorder = recorderWidget({ blob: draft.blob, maxMs: 10 * 60 * 1000, onChange: (b) => { draft.blob = b; } });
        sourceArea.append(h('p', { class: 'field-hint' }, t('care.recordSongHint')), recorder);
      }
    }

    const titleInput = textInput({ value: draft.title, maxlength: 80, onInput: (v) => { draft.title = v; } });
    const artistInput = textInput({ value: draft.artist, maxlength: 80, onInput: (v) => { draft.artist = v; } });

    async function save() {
      draft.title = draft.title.trim();
      draft.artist = (draft.artist || '').trim();
      if (draft.source === 'youtube') {
        const id = parseYouTubeId(link);
        if (!id) { toast(t('care.badLink')); return; }
        draft.yt = [id];
        draft.blob = null;
      } else {
        draft.yt = [];
      }
      if (!draft.title || (draft.source !== 'youtube' && !draft.blob)) {
        toast(t('care.needSong'));
        return;
      }
      await db.put('songs', draft);
      requestPersistence();
      sound.chime();
      toast(t('care.saved'));
      navigate('/care/music');
    }

    async function remove() {
      const ok = await confirmSheet({ title: t('care.deleteSong'), message: existing.title, okLabel: t('common.delete'), danger: true });
      if (!ok) return;
      await db.del('songs', existing.id);
      navigate('/care/music');
    }

    root.append(
      section(t('care.category'), segmented([['songs', t('music.songs')], ['naats', t('music.naats')]], draft.cat, (v) => { draft.cat = v; })),
      section(t('care.songSource'),
        segmented([['youtube', t('care.fromYouTube')], ['file', t('care.fromFile')], ['record', t('care.fromRecord')]], draft.source, (v) => { draft.source = v; paintSource(); }),
        sourceArea),
      section(t('care.songTitle'),
        field(t('care.songTitle'), titleInput),
        field(t('care.songArtist'), artistInput)),
      h('div', { class: 'care-actions sticky' },
        existing ? button({ label: t('common.delete'), iconName: 'trash', kind: 'danger', onTap: remove }) : null,
        button({ label: t('common.save'), iconName: 'check', kind: 'primary', onTap: save })),
    );
    paintSource();
    return () => { if (recorder) recorder.dispose(); };
  },
};
