import { t } from '../../core/i18n.js';
import { h, button } from '../../core/ui.js';
import { navigate, lockCare } from '../../core/router.js';
import { linkRow } from './widgets.js';

export default {
  title: 'care.title',
  back: '/',
  mode: 'care',
  tone: 'care',
  mount(root) {
    const rows = [
      ['people', 'care.people', 'care.peopleSub', '/care/people', 'clay'],
      ['music', 'care.music', 'care.musicSub', '/care/music', 'sky'],
      ['globe', 'care.profile', 'care.profileSub', '/care/profile', 'sage'],
      ['mic', 'care.words', 'care.wordsSub', '/care/words', 'kraft'],
      ['settings', 'care.display', 'care.displaySub', '/care/display', 'lilac'],
      ['download', 'care.backup', 'care.backupSub', '/care/backup', 'paper'],
      ['heart', 'care.about', 'care.aboutSub', '/care/about', 'paper'],
    ];
    root.append(
      h('p', { class: 'care-intro' }, t('care.subtitle')),
      h('div', { class: 'care-links stagger' },
        rows.map(([iconName, title, sub, to, tone], i) => {
          const row = linkRow({ iconName, title: t(title), sub: t(sub), tone, onTap: () => navigate(to) });
          row.style.setProperty('--i', String(i));
          return row;
        })),
      h('div', { class: 'care-footer' },
        button({ label: t('care.exit'), iconName: 'home', kind: 'primary', onTap: () => { lockCare(); navigate('/'); } })),
    );
  },
};
