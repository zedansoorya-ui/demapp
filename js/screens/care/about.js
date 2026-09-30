import { t } from '../../core/i18n.js';
import { h } from '../../core/ui.js';
import { art, icon } from '../../core/art.js';
import { section } from './widgets.js';

export default {
  title: 'care.about',
  back: '/care',
  mode: 'care',
  tone: 'care',
  mount(root) {
    const tips = ['care.tip1', 'care.tip2', 'care.tip3', 'care.tip4', 'care.tip5', 'care.tip6'];
    root.append(
      h('div', { class: 'about-head' },
        h('span', { class: 'about-mark', html: art('logo') }),
        h('p', { class: 'care-intro' }, t('care.aboutIntro'))),
      section(null, h('ul', { class: 'tips' },
        tips.map((key, i) => h('li', { class: 'tip', style: `--i:${i}` },
          h('span', { class: 'tip-icon', html: icon(['people', 'mic', 'music', 'heart', 'sparkle', 'eye'][i]) }),
          h('span', { class: 'tip-text' }, t(key)))))),
      section(null,
        h('p', { class: 'care-note' }, t('care.privacy')),
        h('p', { class: 'care-note' }, t('care.credits')),
        h('p', { class: 'care-note' }, t('care.memoniNote'))),
    );
  },
};
