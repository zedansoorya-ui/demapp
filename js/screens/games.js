import { t } from '../core/i18n.js';
import { say } from '../core/speech.js';
import { h, tile, instruction } from '../core/ui.js';
import { navigate } from '../core/router.js';

const GAMES = [
  { artName: 'coloring', labelKey: 'games.coloring', tone: 'clay', to: '/coloring' },
  { artName: 'sing', labelKey: 'games.sing', tone: 'sky', to: '/sing' },
  { artName: 'faces', labelKey: 'games.faces', tone: 'sage', to: '/faces' },
  { artName: 'memory', labelKey: 'games.memory', tone: 'kraft', to: '/memory' },
  { artName: 'bubbles', labelKey: 'games.bubbles', tone: 'lilac', to: '/bubbles' },
  { artName: 'puzzle', labelKey: 'games.puzzle', tone: 'sky', to: '/puzzle' },
];

export default {
  title: 'games.title',
  tone: 'kraft',
  mount(root, _params, ctx) {
    root.append(
      instruction('games.prompt'),
      h('nav', { class: 'tiles games-tiles stagger', 'aria-label': t('games.title') },
        GAMES.map((g, i) => tile({ ...g, index: i, speak: false, onTap: () => navigate(g.to) }))),
    );
    ctx.setRepeat(() => say('games.prompt'));
    say('games.prompt');
  },
};
