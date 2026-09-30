import { settings, db, uid, requestPersistence } from '../../core/store.js';
import { t } from '../../core/i18n.js';
import { h, button, confirmSheet, toast } from '../../core/ui.js';
import { navigate, setTitle } from '../../core/router.js';
import { sound } from '../../core/sound.js';
import { introduce, getPeople } from '../../core/family.js';
import { section, field, textInput, photoPicker, recorderWidget } from './widgets.js';

export default {
  title: 'care.editPerson',
  back: '/care/people',
  mode: 'care',
  tone: 'care',
  async mount(root, params, ctx) {
    const isNew = params.id === 'new';
    const existing = isNew ? null : await db.get('people', params.id);
    if (!ctx.isCurrent()) return;
    if (!isNew && !existing) {
      navigate('/care/people', { replace: true });
      return;
    }
    setTitle(isNew ? t('care.newPerson') : existing.name);
    const draft = existing ? { ...existing } : { id: uid(), name: '', relation: '', photo: null, voice: null, createdAt: Date.now() };

    const photo = photoPicker({ blob: draft.photo, onChange: (b) => { draft.photo = b; } });
    const name = textInput({ value: draft.name, placeholder: t('care.namePlaceholder'), maxlength: 40, onInput: (v) => { draft.name = v; } });
    const relation = textInput({ value: draft.relation, placeholder: t('care.relationPlaceholder'), maxlength: 60, onInput: (v) => { draft.relation = v; } });
    const who = settings.get().patientName || t('welcome.suggestions').split('|')[0];
    const voice = recorderWidget({ blob: draft.voice, onChange: (b) => { draft.voice = b; } });

    async function save() {
      draft.name = draft.name.trim();
      draft.relation = (draft.relation || '').trim();
      if (!draft.photo || !draft.name) {
        toast(t('care.needPhotoName'));
        return;
      }
      if (isNew) draft.order = (await getPeople()).length;
      await db.put('people', draft);
      requestPersistence();
      sound.chime();
      toast(t('care.saved'));
      navigate('/care/people');
    }

    async function remove() {
      const ok = await confirmSheet({
        title: t('care.deleteConfirm', { name: existing.name }),
        message: t('care.deleteConfirmSub'),
        okLabel: t('common.delete'),
        danger: true,
      });
      if (!ok) return;
      await db.del('people', existing.id);
      toast(t('care.saved'));
      navigate('/care/people');
    }

    root.append(
      section(t('care.photo'), photo),
      section(null,
        field(t('care.name'), name),
        field(t('care.relation', { name: who }), relation, t('care.relationHint'))),
      section(t('care.voice'),
        h('p', { class: 'field-hint' }, t('care.voiceHint')),
        voice,
        button({ label: t('care.testVoice'), iconName: 'speaker', kind: 'ghost', size: 'small', onTap: () => introduce({ ...draft, name: draft.name || '…' }) })),
      h('div', { class: 'care-actions sticky' },
        existing ? button({ label: t('common.delete'), iconName: 'trash', kind: 'danger', onTap: remove }) : null,
        button({ label: t('common.save'), iconName: 'check', kind: 'primary', onTap: save })),
    );
    if (isNew) setTimeout(() => name.focus({ preventScroll: true }), 300);
    return () => voice.dispose();
  },
};
