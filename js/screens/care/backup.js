// Everything lives in this browser, so families can download it all as one file
// and restore it on another device.
import { settings, db, STORES, storageInfo, requestPersistence, DEFAULTS } from '../../core/store.js';
import { t } from '../../core/i18n.js';
import { h, button, confirmSheet, toast } from '../../core/ui.js';
import { blobToDataURL, dataURLToBlob } from '../../core/media.js';
import { navigate } from '../../core/router.js';
import { section, formatBytes } from './widgets.js';

const BLOB_FIELDS = ['photo', 'voice', 'blob'];

async function exportAll() {
  const out = { app: 'yaadein', version: 1, exportedAt: new Date().toISOString(), settings: settings.get() };
  for (const store of STORES) {
    const rows = await db.all(store);
    out[store] = await Promise.all(rows.map(async (row) => {
      const copy = { ...row };
      for (const f of BLOB_FIELDS) {
        if (copy[f] instanceof Blob) copy[f] = { dataURL: await blobToDataURL(copy[f]), type: copy[f].type, name: copy[f].name || null };
      }
      return copy;
    }));
  }
  return out;
}

async function importAll(data) {
  for (const store of STORES) await db.clear(store);
  for (const store of STORES) {
    for (const row of data[store] || []) {
      const copy = { ...row };
      for (const f of BLOB_FIELDS) {
        if (copy[f] && copy[f].dataURL) copy[f] = await dataURLToBlob(copy[f].dataURL);
      }
      await db.put(store, copy);
    }
  }
  settings.replace({ ...DEFAULTS, ...(data.settings || {}), onboarded: true });
}

export default {
  title: 'care.backup',
  back: '/care',
  mode: 'care',
  tone: 'care',
  async mount(root, _params, ctx) {
    const info = h('p', { class: 'care-note' }, '…');
    const refreshInfo = async () => {
      const s = await storageInfo();
      if (!ctx.isCurrent()) return;
      info.textContent = `${t('care.storage', { used: formatBytes(s.usage) })}. ${s.persisted ? t('care.persisted') : t('care.notPersisted')}`;
    };

    const exportBtn = button({
      label: t('care.export'),
      iconName: 'download',
      kind: 'primary',
      onTap: async () => {
        exportBtn.disabled = true;
        toast(t('care.exporting'));
        try {
          const data = await exportAll();
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          const a = h('a', { href: URL.createObjectURL(blob), download: `yaadein-backup-${new Date().toISOString().slice(0, 10)}.json` });
          document.body.append(a);
          a.click();
          setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
        } finally {
          exportBtn.disabled = false;
        }
      },
    });

    const fileInput = h('input', { type: 'file', accept: 'application/json,.json', class: 'visually-hidden', tabindex: '-1' });
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (!file) return;
      let data;
      try {
        data = JSON.parse(await file.text());
      } catch {
        data = null;
      }
      if (!data || data.app !== 'yaadein') {
        toast(t('care.badBackup'));
        return;
      }
      const ok = await confirmSheet({ title: t('care.importTitle'), message: t('care.importHint'), okLabel: t('care.import') });
      if (!ok) return;
      await importAll(data);
      toast(t('care.restored'));
      navigate('/care');
    });

    const clearBtn = button({
      label: t('care.clearAll'),
      iconName: 'trash',
      kind: 'danger',
      onTap: async () => {
        const ok = await confirmSheet({ title: t('care.clearAll'), message: t('care.clearAllConfirm'), okLabel: t('common.delete'), danger: true });
        if (!ok) return;
        for (const store of STORES) await db.clear(store);
        settings.replace({ ...DEFAULTS });
        navigate('/welcome');
      },
    });

    root.append(
      section(t('care.exportTitle'), h('p', { class: 'field-hint' }, t('care.exportHint')), exportBtn),
      section(t('care.importTitle'), h('p', { class: 'field-hint' }, t('care.importHint')),
        button({ label: t('care.import'), iconName: 'upload', kind: 'secondary', onTap: () => fileInput.click() }), fileInput),
      section(null, info),
      section(null, clearBtn),
    );
    await requestPersistence();
    refreshInfo();
  },
};

export { exportAll, importAll };
