// Offline support: the app itself is cached so it opens without internet.
// (Built-in songs still need the internet; they stream from YouTube.)
// Keep SHELL in sync with the files on disk; `npm test` checks it.
const VERSION = 'yaadein-v1';
const FONTS = 'yaadein-fonts-v1';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/main.js',
  './js/data/catalog.js',
  './js/data/pages.js',
  './js/data/things.js',
  './js/lang/en.js',
  './js/lang/hi.js',
  './js/lang/mem.js',
  './js/lang/ur.js',
  './js/core/art.js',
  './js/core/family.js',
  './js/core/i18n.js',
  './js/core/media.js',
  './js/core/motion.js',
  './js/core/music.js',
  './js/core/router.js',
  './js/core/sound.js',
  './js/core/speech.js',
  './js/core/store.js',
  './js/core/translit.js',
  './js/core/ui.js',
  './js/screens/breathe.js',
  './js/screens/bubbles.js',
  './js/screens/coloring-picker.js',
  './js/screens/coloring.js',
  './js/screens/faces.js',
  './js/screens/family.js',
  './js/screens/games.js',
  './js/screens/home.js',
  './js/screens/memory.js',
  './js/screens/music.js',
  './js/screens/person.js',
  './js/screens/player.js',
  './js/screens/puzzle.js',
  './js/screens/sing.js',
  './js/screens/slideshow.js',
  './js/screens/tasbeeh.js',
  './js/screens/welcome.js',
  './js/screens/care/about.js',
  './js/screens/care/backup.js',
  './js/screens/care/display.js',
  './js/screens/care/hub.js',
  './js/screens/care/music.js',
  './js/screens/care/people.js',
  './js/screens/care/person-edit.js',
  './js/screens/care/profile.js',
  './js/screens/care/song-edit.js',
  './js/screens/care/widgets.js',
  './js/screens/care/words.js',
  './icons/apple-touch-icon.png',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('yaadein-') && k !== VERSION && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/* Serve from cache straight away, refresh the cache in the background. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) return cached;
  const fresh = await network;
  if (fresh) return fresh;
  if (request.mode === 'navigate') return cache.match('./index.html');
  return new Response('', { status: 504, statusText: 'Offline' });
}

async function cacheFirst(request, name) {
  const cache = await caches.open(name);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, FONTS));
  }
  // Everything else (YouTube) goes straight to the network.
});
