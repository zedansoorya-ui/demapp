// End-to-end check of Yaadein in a real browser: `npm test`
// Needs Playwright (`npm i -D playwright && npx playwright install chromium`).
// External sites are blocked and YouTube is replaced by a fake player, so the
// test is deterministic and works offline.
import { Buffer } from 'node:buffer';
import { spawn, spawnSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright/index.mjs'));
  } catch {
    console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
    process.exit(1);
  }
}

let failures = 0;
const ok = (cond, label, detail = '') => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${!cond && detail ? `  (${detail})` : ''}`);
  if (!cond) failures += 1;
};

/* ---------- Static checks ---------- */
console.log('Static checks');
const langs = spawnSync(process.execPath, [join(root, 'scripts/check-langs.mjs')], { encoding: 'utf8' });
ok(langs.status === 0, 'language packs are consistent', langs.stdout.split('\n').filter((l) => l.includes('✗')).join('; '));

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const missing = [...walk(join(root, 'js')), ...walk(join(root, 'icons'))]
  .map((p) => `./${relative(root, p).split('\\').join('/')}`)
  .filter((p) => !sw.includes(`'${p}'`));
ok(missing.length === 0, 'service worker caches every app file', missing.join(', '));

/* ---------- Browser checks ---------- */
const port = 8800 + Math.floor(Math.random() * 500);
const server = spawn(process.execPath, [join(root, 'scripts/serve.mjs'), String(port)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const BASE = `http://localhost:${port}/?nosw`;

const FAKE_YT = `
  window.__loads = [];
  class Player {
    constructor(el, o) { this.o = o; this.v = o.videoId; window.__yt = this; window.__loads.push(this.v);
      const f = document.createElement('iframe'); el.replaceWith(f); setTimeout(() => o.events.onReady({ target: this }), 30); }
    playVideo() { setTimeout(() => this.o.events.onStateChange({ data: 1 }), 30); }
    pauseVideo() { this.o.events.onStateChange({ data: 2 }); }
    loadVideoById(id) { this.v = id; window.__loads.push(id); this.playVideo(); }
    stopVideo() {} destroy() {} getVideoData() { return { video_id: this.v }; }
  }
  window.YT = { Player, PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 } };
  window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });

async function newPage(settings, viewport = { width: 1180, height: 820 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(`http://localhost:${port}`)) return route.continue();
    if (url.startsWith('https://www.youtube.com/iframe_api')) return route.fulfill({ contentType: 'text/javascript', body: FAKE_YT });
    return route.abort();
  });
  await page.goto(`${BASE}#/`);
  if (settings) {
    await page.evaluate((s) => localStorage.setItem('yaadein.settings.v1', JSON.stringify(s)), settings);
    await page.goto(`${BASE}#/`);
    await page.reload();
  }
  await page.waitForTimeout(400);
  return { page, errors, context };
}

async function seed(page, n = 3) {
  await page.evaluate(async (count) => {
    const blob = (hue) => new Promise((resolve) => {
      const c = document.createElement('canvas');
      c.width = 300; c.height = 300;
      const g = c.getContext('2d');
      g.fillStyle = `hsl(${hue},60%,70%)`; g.fillRect(0, 0, 300, 300);
      c.toBlob(resolve, 'image/jpeg');
    });
    const db = await new Promise((res) => { const r = indexedDB.open('yaadein', 1); r.onupgradeneeded = () => ['people', 'songs', 'clips', 'art'].forEach((s) => r.result.createObjectStore(s, { keyPath: 'id' })); r.onsuccess = () => res(r.result); });
    const names = ['Zainab', 'Yusuf', 'Ayesha', 'Imran'];
    for (let i = 0; i < count; i += 1) {
      const rec = { id: `p${i}`, name: names[i], relation: 'your grandchild', photo: await blob(i * 80), voice: null, order: i, createdAt: i };
      await new Promise((res) => { const t = db.transaction('people', 'readwrite'); t.objectStore('people').put(rec); t.oncomplete = res; });
    }
  }, n);
}

const EN = { lang: 'en', onboarded: true, patientName: 'Ammi' };

try {
  console.log('First run');
  {
    const { page, errors, context } = await newPage(null);
    ok((await page.evaluate(() => location.hash)) === '#/welcome', 'new visitors start at the welcome screen');
    await page.getByRole('button', { name: /हिन्दी/ }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'आगे चलें' }).click();
    await page.getByRole('button', { name: 'दादी' }).click();
    await page.getByRole('button', { name: 'आगे चलें' }).click();
    await page.getByRole('button', { name: 'शुरू करें' }).click();
    await page.waitForTimeout(700);
    ok((await page.textContent('.greeting')).includes('दादी'), 'greets the person by the chosen name in Hindi');
    ok((await page.locator('.tile-label').first().textContent()) === 'मेरा परिवार', 'home tiles are in Hindi');
    ok(errors.length === 0, 'no errors during first run', errors.join(' | '));
    await context.close();
  }

  console.log('Languages');
  for (const [code, dir, family] of [['en', 'ltr', 'My Family'], ['hi', 'ltr', 'मेरा परिवार'], ['ur', 'rtl', 'میرے گھر والے'], ['mem', 'ltr', 'Mijho Kutumb']]) {
    const { page, errors, context } = await newPage({ ...EN, lang: code });
    await page.mouse.click(10, 10);
    const html = await page.evaluate(() => ({ dir: document.documentElement.dir, text: document.body.innerText }));
    ok(html.dir === dir, `${code}: page direction is ${dir}`);
    ok(html.text.includes(family), `${code}: shows "${family}"`);
    ok(!/\b(home|family|music|games|common|care)\.[a-zA-Z]+\b/.test(html.text), `${code}: no untranslated keys on screen`);
    await page.goto(`${BASE}#/games`);
    await page.waitForTimeout(300);
    ok(!/\b(games|common)\.[a-zA-Z]+\b/.test(await page.evaluate(() => document.body.innerText)), `${code}: games screen fully translated`);
    ok(errors.length === 0, `${code}: no errors`, errors.join(' | '));
    await context.close();
  }

  console.log('Family and "Who is this?"');
  {
    const { page, errors, context } = await newPage({ ...EN, faceChoices: 3 });
    await seed(page, 3);
    await page.goto(`${BASE}#/family`);
    await page.waitForTimeout(500);
    ok((await page.locator('.person-card').count()) === 3, 'shows every loved one');
    await page.goto(`${BASE}#/faces`);
    await page.waitForTimeout(600);
    ok((await page.locator('.face-card').count()) === 3, 'asks with three photos');
    const prompt = await page.textContent('.faces-prompt-text');
    await page.locator('.face-card[data-target="false"]').first().click();
    await page.waitForTimeout(600);
    ok((await page.locator('.face-card.named').count()) === 1, 'a wrong photo is gently named, not marked wrong');
    await page.locator('.face-card[data-target="true"]').click();
    await page.waitForTimeout(500);
    ok((await page.locator('.face-card.right').count()) === 1 && (await page.locator('.celebrate').count()) === 1, `celebrates the right answer (${prompt})`);
    ok(errors.length === 0, 'no errors', errors.join(' | '));
    await context.close();
  }

  console.log('Games');
  {
    const { page, errors, context } = await newPage(EN);
    await page.goto(`${BASE}#/coloring/house`);
    await page.waitForTimeout(500);
    const box = await page.locator('.coloring-svg').boundingBox();
    await page.locator('.swatch').nth(0).click();
    await page.mouse.click(box.x + box.width * 200 / 600, box.y + box.height * 280 / 600);
    await page.waitForTimeout(900);
    ok((await page.getAttribute('[data-id="roof"]', 'fill')) === '#d64545', 'colouring fills the touched shape');

    await page.goto(`${BASE}#/memory`);
    await page.waitForTimeout(500);
    const keys = await page.$$eval('.mem-card', (els) => els.map((e) => e.dataset.key));
    const groups = {};
    keys.forEach((k, i) => { (groups[k] ||= []).push(i); });
    for (const [a, b] of Object.values(groups)) {
      await page.locator('.mem-card').nth(a).click();
      await page.waitForTimeout(300);
      await page.locator('.mem-card').nth(b).click();
      await page.waitForTimeout(1000);
    }
    await page.waitForTimeout(3300);
    ok((await page.locator('.mem-card.matched').count()) === keys.length, 'memory game can be finished');

    await page.goto(`${BASE}#/puzzle`);
    await page.waitForTimeout(400);
    await page.locator('.page-card').first().click();
    await page.waitForTimeout(500);
    for (let guard = 0; guard < 12; guard += 1) {
      const at = await page.$$eval('.piece', (els) => els.map((e) => +e.style.getPropertyValue('--y') * Math.round(Math.sqrt(els.length)) + +e.style.getPropertyValue('--x')));
      const wrong = at.findIndex((p, i) => p !== i);
      if (wrong < 0) break;
      await page.locator('.piece').nth(wrong).click();
      await page.waitForTimeout(220);
      await page.locator('.piece').nth(at.indexOf(wrong)).click();
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(600);
    ok((await page.locator('.puzzle-board.solved').count()) === 1, 'picture puzzle can be solved');

    await page.goto(`${BASE}#/tasbeeh`);
    await page.waitForTimeout(400);
    for (let i = 0; i < 33; i += 1) await page.locator('.tasbeeh-pad').dispatchEvent('pointerdown');
    await page.waitForTimeout(3500);
    ok((await page.textContent('.tasbeeh-tr')) === 'Alhamdulillah', 'tasbeeh moves on after 33');

    await page.goto(`${BASE}#/sing`);
    await page.waitForTimeout(400);
    const garden = await page.locator('.garden').boundingBox();
    await page.mouse.move(garden.x + garden.width / 2, garden.y + garden.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(2500);
    await page.mouse.up();
    const grown = await page.$$eval('.garden-svg line', (ls) => ls.filter((l) => +l.getAttribute('y2') < 440 && l.getAttribute('stroke') === '#788c5d').length);
    ok(grown >= 1, 'singing garden grows when touched');

    await page.goto(`${BASE}#/bubbles`);
    await page.waitForTimeout(1500);
    ok((await page.locator('.bubbles-canvas').count()) === 1, 'bubbles open');
    await page.goto(`${BASE}#/breathe`);
    await page.waitForTimeout(500);
    ok((await page.locator('.breath').count()) === 1, 'breathing opens');
    ok(errors.length === 0, 'no errors in games', errors.join(' | '));
    await context.close();
  }

  console.log('Music');
  {
    const { page, errors, context } = await newPage(EN);
    await page.goto(`${BASE}#/music/songs`);
    await page.waitForTimeout(500);
    ok((await page.locator('.song-card').count()) === 28, 'lists the 28 built-in songs');
    await page.goto(`${BASE}#/music/naats`);
    await page.waitForTimeout(500);
    ok((await page.locator('.song-card').count()) === 13, 'lists the 13 built-in naats');
    await page.goto(`${BASE}#/play/naats/mustafa-jaan-e-rehmat`);
    await page.waitForTimeout(800);
    ok(await page.evaluate(() => document.querySelector('.player-media').classList.contains('playing')), 'player starts the naat');
    await page.locator('.player-extra .btn').click();
    await page.waitForTimeout(300);
    ok((await page.locator('.lyric-line').count()) === 8, 'shows public-domain words to sing along');
    await page.evaluate(() => window.__yt.o.events.onStateChange({ data: 0 }));
    await page.waitForTimeout(400);
    ok((await page.evaluate(() => location.hash)) === '#/play/naats/ye-sab-tumhara', 'moves to the next naat when one ends');
    await page.evaluate(() => window.__yt.o.events.onError({ data: 150 }));
    await page.waitForTimeout(300);
    ok((await page.evaluate(() => window.__loads.slice(-1)[0])) === 'U3FFWMwOtu4', 'falls back to the second video if the first is unavailable');
    ok(errors.length === 0, 'no errors in music', errors.join(' | '));
    await context.close();
  }

  console.log('Family settings');
  {
    const { page, errors, context } = await newPage(EN);
    await page.mouse.click(600, 500);
    await page.goto(`${BASE}#/care`);
    await page.waitForTimeout(300);
    ok((await page.evaluate(() => location.hash)) === '#/', 'family settings stay locked without the long press');
    const hold = await page.locator('.hold').boundingBox();
    await page.mouse.move(hold.x + 20, hold.y + hold.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(2300);
    await page.mouse.up();
    await page.waitForTimeout(400);
    ok((await page.evaluate(() => location.hash)) === '#/care', 'a 2-second press opens family settings');
    await page.goto(`${BASE}#/care/people/new`);
    await page.waitForTimeout(400);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP4z8DwnwEIGP4zMDAwAAA2FAb/gaxgbQAAAABJRU5ErkJggg==', 'base64');
    await page.locator('.photo-picker input[type=file]').first().setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png });
    await page.waitForTimeout(500);
    await page.locator('input.input').nth(0).fill('Farida');
    await page.locator('input.input').nth(1).fill('your sister');
    await page.getByRole('button', { name: 'Record' }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Stop' }).click();
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(700);
    const saved = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('yaadein'); r.onsuccess = () => { const q = r.result.transaction('people').objectStore('people').getAll(); q.onsuccess = () => res(q.result.map((p) => ({ name: p.name, photo: !!p.photo, voice: !!p.voice }))); }; }));
    ok(saved.length === 1 && saved[0].photo && saved[0].voice, 'a loved one is saved with photo and recorded voice', JSON.stringify(saved));
    await page.goto(`${BASE}#/care/backup`);
    await page.waitForTimeout(500);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download backup' }).click()]);
    const backup = JSON.parse(readFileSync(await download.path(), 'utf8'));
    ok(backup.app === 'yaadein' && backup.people.length === 1 && backup.people[0].voice && backup.people[0].voice.dataURL, 'backup includes photos and voices');
    ok(errors.length === 0, 'no errors in family settings', errors.join(' | '));
    await context.close();
  }

  console.log('Phone layout');
  {
    const { page, errors, context } = await newPage(EN, { width: 390, height: 844 });
    await page.mouse.click(10, 10);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(overflow <= 0, 'no sideways scrolling on a phone', `${overflow}px too wide`);
    ok(errors.length === 0, 'no errors on phone', errors.join(' | '));
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
