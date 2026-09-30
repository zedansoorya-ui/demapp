// Yaadein — a calm, familiar place for someone living with dementia.
import { settings, db } from './core/store.js';
import { applyLanguage } from './core/i18n.js';
import { route, startRouter, currentPath, navigate } from './core/router.js';
import { unlockAudio } from './core/sound.js';

function applyPreferences() {
  const s = settings.get();
  const root = document.documentElement;
  root.dataset.text = s.text === 'xl' ? 'xl' : 'l';
  root.classList.toggle('calm', !!s.calm);
  applyLanguage();
}
settings.subscribe(applyPreferences);
applyPreferences();

/* ---------- Screens ---------- */
route('/', () => import('./screens/home.js'));
route('/welcome', () => import('./screens/welcome.js'));
route('/family', () => import('./screens/family.js'));
route('/family/:id', () => import('./screens/person.js'));
route('/slideshow', () => import('./screens/slideshow.js'));
route('/faces', () => import('./screens/faces.js'));
route('/music/:cat', () => import('./screens/music.js'));
route('/play/:cat/:id', () => import('./screens/player.js'));
route('/games', () => import('./screens/games.js'));
route('/coloring', () => import('./screens/coloring-picker.js'));
route('/coloring/:page', () => import('./screens/coloring.js'));
route('/sing', () => import('./screens/sing.js'));
route('/memory', () => import('./screens/memory.js'));
route('/bubbles', () => import('./screens/bubbles.js'));
route('/puzzle', () => import('./screens/puzzle.js'));
route('/tasbeeh', () => import('./screens/tasbeeh.js'));
route('/breathe', () => import('./screens/breathe.js'));
route('/care', () => import('./screens/care/hub.js'));
route('/care/profile', () => import('./screens/care/profile.js'));
route('/care/people', () => import('./screens/care/people.js'));
route('/care/people/:id', () => import('./screens/care/person-edit.js'));
route('/care/music', () => import('./screens/care/music.js'));
route('/care/music/:id', () => import('./screens/care/song-edit.js'));
route('/care/words', () => import('./screens/care/words.js'));
route('/care/display', () => import('./screens/care/display.js'));
route('/care/backup', () => import('./screens/care/backup.js'));
route('/care/about', () => import('./screens/care/about.js'));

/* First visit: choose a language and a name before anything else. */
if (!settings.get().onboarded && currentPath() !== '/welcome') {
  history.replaceState(null, '', '#/welcome');
}

/* Browsers only allow sound after the first touch. */
const unlock = () => unlockAudio();
window.addEventListener('pointerdown', unlock, { once: true, capture: true });
window.addEventListener('keydown', unlock, { once: true, capture: true });

startRouter();

/* ---------- Photo frame when the tablet is left alone on the home screen ---------- */
let lastActivity = Date.now();
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((type) => {
  window.addEventListener(type, () => { lastActivity = Date.now(); }, { passive: true, capture: true });
});
setInterval(async () => {
  const s = settings.get();
  if (!s.idlePhotos || !s.onboarded || currentPath() !== '/') return;
  if (Date.now() - lastActivity < 3 * 60 * 1000) return;
  if (document.querySelector('.sheet-backdrop, .wake-veil')) return;
  const people = await db.all('people');
  if (people.filter((p) => p.photo).length) {
    lastActivity = Date.now();
    navigate('/slideshow?idle=1');
  }
}, 20000);

/* ---------- Offline support ---------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !/[?&]nosw\b/.test(location.search)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker not registered', err));
  });
}

window.addEventListener('unhandledrejection', (e) => console.warn('Unhandled promise rejection', e.reason));
