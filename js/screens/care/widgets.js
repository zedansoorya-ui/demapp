// Building blocks for the family settings screens.
import { t } from '../../core/i18n.js';
import { h, append, button, tap, toast } from '../../core/ui.js';
import { icon } from '../../core/art.js';
import { VoiceRecorder, canRecord, blobURL, playBlob, stopAudio, resizeImage } from '../../core/media.js';
import { sound } from '../../core/sound.js';

export function section(title, ...children) {
  return h('section', { class: 'care-section' },
    title ? h('h2', { class: 'care-section-title' }, title) : null,
    ...children);
}

export function linkRow({ iconName, title, sub, onTap, tone = 'paper' }) {
  const row = h('button', { type: 'button', class: `care-link tone-${tone}` },
    h('span', { class: 'care-link-icon', html: icon(iconName) }),
    h('span', { class: 'care-link-text' },
      h('span', { class: 'care-link-title' }, title),
      sub ? h('span', { class: 'care-link-sub' }, sub) : null),
    h('span', { class: 'care-link-chevron', html: icon('forward') }));
  tap(row, () => { sound.tap(); onTap(); });
  return row;
}

export function toggleRow({ title, sub, value, onChange }) {
  const sw = h('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(!!value), 'aria-label': title });
  tap(sw, () => {
    const next = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', String(next));
    sound.tap();
    onChange(next);
  }, { debounce: 250 });
  return h('div', { class: 'switch-row' },
    h('div', { class: 'switch-text' },
      h('span', { class: 'field-label' }, title),
      sub ? h('span', { class: 'field-hint' }, sub) : null),
    sw);
}

export function segmented(options, value, onChange, label = '') {
  const el = h('div', { class: 'segmented', role: 'group', 'aria-label': label });
  options.forEach(([val, text]) => {
    const b = h('button', { type: 'button', 'aria-pressed': String(val === value) }, text);
    tap(b, () => {
      el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      sound.tap();
      onChange(val);
    }, { debounce: 200 });
    el.append(b);
  });
  return el;
}

export function field(label, control, hint) {
  return h('label', { class: 'field' },
    h('span', { class: 'field-label' }, label),
    control,
    hint ? h('span', { class: 'field-hint' }, hint) : null);
}

export function textInput({ value = '', placeholder = '', onInput, maxlength = 80, dir = 'auto' }) {
  const input = h('input', { class: 'input', type: 'text', value, placeholder, maxlength: String(maxlength), dir, autocomplete: 'off', spellcheck: 'false' });
  if (onInput) input.addEventListener('input', () => onInput(input.value));
  return input;
}

/* Choose or take a photo; it is shrunk on this device before saving. */
export function photoPicker({ blob, onChange }) {
  let current = blob || null;
  const preview = h('div', { class: 'photo-preview' });
  const paint = () => {
    preview.replaceChildren(current
      ? h('img', { src: blobURL(current), alt: '' })
      : h('span', { class: 'photo-empty', html: icon('image') }));
  };
  paint();
  const make = (capture) => {
    const input = h('input', { type: 'file', accept: 'image/*', class: 'visually-hidden', tabindex: '-1' });
    if (capture) input.setAttribute('capture', 'user');
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      try {
        current = await resizeImage(file);
        paint();
        onChange(current);
      } catch {
        toast(t('care.photoError'));
      }
    });
    return input;
  };
  const chooseInput = make(false);
  const takeInput = make(true);
  const choose = button({ label: t(blob ? 'care.changePhoto' : 'care.choosePhoto'), iconName: 'image', kind: 'secondary', size: 'small', onTap: () => chooseInput.click() });
  const take = button({ label: t('care.takePhoto'), iconName: 'camera', kind: 'secondary', size: 'small', onTap: () => takeInput.click() });
  return h('div', { class: 'photo-picker' }, preview, h('div', { class: 'photo-actions' }, choose, take, chooseInput, takeInput));
}

/* Record a voice (or use a voice note from the phone). */
export function recorderWidget({ blob, onChange, maxMs = 15000, compact = false }) {
  let current = blob || null;
  let recorder = null;
  let started = 0;
  let timer = 0;
  const box = h('div', { class: `recorder${compact ? ' compact' : ''}` });
  const upload = h('input', { type: 'file', accept: 'audio/*', class: 'visually-hidden', tabindex: '-1' });
  upload.addEventListener('change', () => {
    const file = upload.files && upload.files[0];
    upload.value = '';
    if (!file) return;
    current = file;
    onChange(current);
    render();
  });

  const meter = h('span', { class: 'rec-meter' }, ...Array.from({ length: 7 }, () => h('i')));

  async function start() {
    if (!canRecord()) {
      toast(t('care.micUnsupported'));
      return;
    }
    stopAudio();
    const bars = meter.querySelectorAll('i');
    recorder = new VoiceRecorder({
      maxMs,
      onLevel: (v) => bars.forEach((bar, i) => bar.classList.toggle('on', v > (i + 0.5) / 8)),
    });
    try {
      await recorder.start();
    } catch {
      recorder = null;
      toast(t('care.micDenied'));
      return;
    }
    started = Date.now();
    render();
    timer = setInterval(render, 250);
    recorder.done.then((result) => {
      clearInterval(timer);
      recorder = null;
      if (result && result.size > 800) {
        current = result;
        onChange(current);
      }
      render();
    });
  }

  function render() {
    box.replaceChildren();
    if (recorder) {
      const secs = Math.floor((Date.now() - started) / 1000);
      append(box, [
        h('span', { class: 'rec-live' }, h('span', { class: 'rec-dot' }), compact ? `${secs}s` : t('care.recording', { seconds: secs })),
        meter,
        button({ label: compact ? null : t('care.stopRecording'), iconName: 'stop', kind: 'primary', size: 'small', cls: compact ? 'btn-round' : '', attrs: compact ? { 'aria-label': t('care.stopRecording') } : {}, onTap: () => recorder && recorder.stop() }),
      ]);
      return;
    }
    if (current) {
      append(box, [
        compact ? null : h('span', { class: 'rec-state ok' }, h('span', { html: icon('check') }), t('care.hasVoice')),
        button({ label: compact ? null : t('care.listen'), iconName: 'play', kind: 'secondary', size: 'small', cls: compact ? 'btn-round' : '', attrs: compact ? { 'aria-label': t('care.listen') } : {}, onTap: () => playBlob(current) }),
        button({ label: compact ? null : t('care.recordAgain'), iconName: 'mic', kind: 'secondary', size: 'small', cls: compact ? 'btn-round' : '', attrs: compact ? { 'aria-label': t('care.recordAgain') } : {}, onTap: start }),
        button({ label: compact ? null : t('care.removeVoice'), iconName: 'trash', kind: 'danger', size: 'small', cls: compact ? 'btn-round' : '', attrs: compact ? { 'aria-label': t('care.removeVoice') } : {}, onTap: () => { stopAudio(); current = null; onChange(null); render(); } }),
      ]);
    } else {
      if (!compact) box.append(h('span', { class: 'rec-state' }, t('care.noVoice')));
      append(box, [
        button({ label: compact ? null : t('care.record'), iconName: 'record', kind: 'clay', size: 'small', cls: compact ? 'btn-round rec-btn' : 'rec-btn', attrs: compact ? { 'aria-label': t('care.record') } : {}, onTap: start }),
        compact ? null : button({ label: t('care.uploadAudio'), iconName: 'upload', kind: 'secondary', size: 'small', onTap: () => upload.click() }),
      ]);
    }
    box.append(upload);
  }

  render();
  box.dispose = () => {
    clearInterval(timer);
    if (recorder) recorder.stop();
    stopAudio();
  };
  return box;
}

export function formatBytes(n) {
  if (n == null) return '—';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
