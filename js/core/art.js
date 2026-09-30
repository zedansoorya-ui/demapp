// Icons and illustrations. Line art uses ink outlines with round ends and flat
// fills from the brand palette; outlines carry class "ln" + pathLength="1" so they
// can draw themselves in when a tile appears.

export const C = {
  ink: '#141413',
  paper: '#faf9f5',
  card: '#fffefb',
  clay: '#d97757',
  clayDeep: '#a9502f',
  claySoft: '#f5dccf',
  clayTint: '#fbefe9',
  sky: '#6a9bcc',
  skyDeep: '#34689c',
  skySoft: '#dbe7f3',
  skyTint: '#eef4fa',
  sage: '#788c5d',
  sageDeep: '#4f6337',
  sageSoft: '#e1e8d5',
  sageTint: '#f1f4ea',
  kraft: '#d4a27f',
  kraftSoft: '#f2e3d5',
  manilla: '#ebdbbc',
  lilac: '#9c8cc4',
  lilacSoft: '#e9e4f3',
  gold: '#e3b448',
  rose: '#e28e98',
  mid: '#b0aea5',
  line: '#e8e6dc',
  skin: '#e9c9a0',
  skin2: '#d9b48f',
};

/* Path builders so every outline can be a <path> (needed for pathLength). */
export const circ = (cx, cy, r) => `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
export const ell = (cx, cy, rx, ry) => `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${2 * rx},0a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
export const rrect = (x, y, w, h, r) => {
  const rr = Math.min(r, w / 2, h / 2);
  return `M${x + rr},${y}H${x + w - rr}A${rr},${rr} 0 0 1 ${x + w},${y + rr}V${y + h - rr}A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}H${x + rr}A${rr},${rr} 0 0 1 ${x},${y + h - rr}V${y + rr}A${rr},${rr} 0 0 1 ${x + rr},${y}Z`;
};
export function starPath(cx, cy, R, r, n = 5, rot = -90) {
  let d = '';
  for (let i = 0; i < n * 2; i += 1) {
    const rad = (i % 2 === 0 ? R : r);
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }
  return d + 'Z';
}
export const sparkle = (cx, cy, s) => `M${cx},${cy - s}Q${cx + s * 0.12},${cy - s * 0.12} ${cx + s},${cy}Q${cx + s * 0.12},${cy + s * 0.12} ${cx},${cy + s}Q${cx - s * 0.12},${cy + s * 0.12} ${cx - s},${cy}Q${cx - s * 0.12},${cy - s * 0.12} ${cx},${cy - s}Z`;

const SW = 3.2;
/* A filled shape with an ink outline that draws in. */
const shape = (d, fill, sw = SW) => `<path d="${d}" fill="${fill}"/><path class="ln" pathLength="1" d="${d}" fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const line = (d, stroke = C.ink, sw = SW) => `<path class="ln" pathLength="1" d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const fill = (d, color) => `<path d="${d}" fill="${color}"/>`;

export const svg = (inner, viewBox = '0 0 120 120', cls = '') =>
  `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ''}>${inner}</svg>`;

/* ---------- UI icons (24px grid) ---------- */
const I = (inner, extra = '') => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"${extra}>${inner}</svg>`;

export const ICONS = {
  home: I('<path d="M3.5 11 12 3.8 20.5 11"/><path d="M5.8 9.2v10.3h12.4V9.2"/><path d="M10 19.5v-5.2h4v5.2"/>'),
  back: I('<path d="M14.5 5.5 8 12l6.5 6.5"/>', ' class="flip-rtl"'),
  forward: I('<path d="M9.5 5.5 16 12l-6.5 6.5"/>', ' class="flip-rtl"'),
  arrowBack: I('<path d="M19.5 12h-15"/><path d="M10.5 5.5 4 12l6.5 6.5"/>', ' class="flip-rtl"'),
  arrowForward: I('<path d="M4.5 12h15"/><path d="M13.5 5.5 20 12l-6.5 6.5"/>', ' class="flip-rtl"'),
  speaker: I('<path d="M4 9.3h3.4L12 5.5v13l-4.6-3.8H4z" fill="currentColor"/><path d="M15.6 9a4.4 4.4 0 0 1 0 6"/><path d="M18.4 6.4a8.2 8.2 0 0 1 0 11.2"/>'),
  play: I('<path d="M8.2 5.6v12.8a.9.9 0 0 0 1.35.78l10.2-6.4a.9.9 0 0 0 0-1.56L9.55 4.82a.9.9 0 0 0-1.35.78z" fill="currentColor"/>'),
  pause: I('<rect x="6.2" y="5" width="4" height="14" rx="1.4" fill="currentColor"/><rect x="13.8" y="5" width="4" height="14" rx="1.4" fill="currentColor"/>'),
  next: I('<path d="M5.5 6.2v11.6a.8.8 0 0 0 1.25.66l8.3-5.8a.8.8 0 0 0 0-1.32l-8.3-5.8a.8.8 0 0 0-1.25.66z" fill="currentColor"/><path d="M18.5 5.5v13"/>', ' class="flip-rtl"'),
  prev: I('<path d="M18.5 6.2v11.6a.8.8 0 0 1-1.25.66l-8.3-5.8a.8.8 0 0 1 0-1.32l8.3-5.8a.8.8 0 0 1 1.25.66z" fill="currentColor"/><path d="M5.5 5.5v13"/>', ' class="flip-rtl"'),
  heart: I('<path d="M12 20s-7.6-4.6-7.6-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.6 2.6C19.6 15.4 12 20 12 20z"/>'),
  settings: I('<path d="M4 7h9.5"/><path d="M18.5 7H20"/><circle cx="16" cy="7" r="2.4"/><path d="M4 17h3.5"/><path d="M12.5 17H20"/><circle cx="10" cy="17" r="2.4"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  trash: I('<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.6 7l1 12.6h8.8l1-12.6"/><path d="M10.2 11v5M13.8 11v5"/>'),
  edit: I('<path d="M4 20l1-4.6L15.4 5a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L8.6 19z"/><path d="M13.6 6.9l3.5 3.5"/>'),
  mic: I('<rect x="9" y="3.4" width="6" height="11" rx="3"/><path d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0"/><path d="M12 17.8v2.8"/>'),
  stop: I('<rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/>'),
  record: I('<circle cx="12" cy="12" r="6.5" fill="currentColor" stroke="none"/>'),
  camera: I('<path d="M4 8.5h3.2l1.6-2.6h6.4l1.6 2.6H20v10.2H4z"/><circle cx="12" cy="13.2" r="3.4"/>'),
  image: I('<rect x="3.5" y="4.8" width="17" height="14.4" rx="2.6"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17.4l5-4.6 4 3.6 3-2.6 4.5 3.8"/>'),
  check: I('<path d="M5 12.5l4.6 4.6L19 7.6"/>'),
  star: I('<path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z"/>'),
  undo: I('<path d="M8.5 8.5H4.2V4.2"/><path d="M4.5 8.3A8 8 0 1 1 6 16.8"/>'),
  refresh: I('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.8 4.6v4.4h-4.4"/>'),
  globe: I('<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8"/><path d="M12 3.4c2.5 2.4 3.8 5.2 3.8 8.6s-1.3 6.2-3.8 8.6c-2.5-2.4-3.8-5.2-3.8-8.6S9.5 5.8 12 3.4z"/>'),
  download: I('<path d="M12 4v11"/><path d="M7.4 10.6 12 15.2l4.6-4.6"/><path d="M5 19.6h14"/>'),
  upload: I('<path d="M12 15.5V4.5"/><path d="M7.4 9 12 4.4 16.6 9"/><path d="M5 19.6h14"/>'),
  eye: I('<path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: I('<path d="M3.5 3.5l17 17"/><path d="M10.1 6a9.6 9.6 0 0 1 1.9-.2c5.8 0 9.2 6.2 9.2 6.2a17 17 0 0 1-2.6 3.4"/><path d="M6.3 7.6A16.5 16.5 0 0 0 2.8 12s3.4 6.2 9.2 6.2a9 9 0 0 0 4.2-1"/>'),
  lyrics: I('<path d="M5 6.5h14M5 11.5h14M5 16.5h8.5"/>'),
  close: I('<path d="M6 6l12 12M18 6 6 18"/>'),
  music: I('<path d="M9 17.8V6.2l10-2.2v11.6"/><circle cx="6.6" cy="17.8" r="2.5"/><circle cx="16.6" cy="15.6" r="2.5"/>'),
  people: I('<circle cx="9" cy="8.4" r="3.2"/><path d="M3.4 19.4c0-3.4 2.5-5.6 5.6-5.6s5.6 2.2 5.6 5.6"/><circle cx="17" cy="9.6" r="2.5"/><path d="M15.6 14.2c2.8-.4 5 1.4 5 4.6"/>'),
  clock: I('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/>'),
  hand: I('<path d="M9.2 12V5.6a1.6 1.6 0 0 1 3.2 0V11"/><path d="M12.4 10.2V9a1.6 1.6 0 0 1 3.2 0v2"/><path d="M15.6 10.6a1.6 1.6 0 0 1 3.2 0V15a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-4.6-2.2l-3-3.8a1.6 1.6 0 0 1 2.4-2.1l1.6 1.7"/>'),
  up: I('<path d="M6 14.5 12 8.5l6 6"/>'),
  down: I('<path d="M6 9.5 12 15.5l6-6"/>'),
  link: I('<path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1.2 1.2"/><path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1.2-1.2"/>'),
  file: I('<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/><circle cx="10.5" cy="15.5" r="1.8"/><path d="M12.3 15.5v-5l2.7 1"/>'),
  book: I('<path d="M4 5.2c2.8-1 5.6-1 8 .8 2.4-1.8 5.2-1.8 8-.8v13.4c-2.8-1-5.6-1-8 .8-2.4-1.8-5.2-1.8-8-.8z"/><path d="M12 6v13.4"/>'),
  sparkle: I('<path d="M12 3.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5z"/>'),
  shuffle: I('<path d="M4 7h3.5c3 0 4.5 10 8 10H20"/><path d="M4 17h3.5c1.4 0 2.4-2 3.3-4.2"/><path d="M13.3 9.2C14 7.9 14.8 7 16 7h4"/><path d="M17.5 4.6 20 7l-2.5 2.4"/><path d="M17.5 14.6 20 17l-2.5 2.4"/>'),
  sun: I('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>'),
  moon: I('<path d="M19.4 14.6A8 8 0 0 1 9.4 4.6a8 8 0 1 0 10 10z"/>'),
};

export function icon(name) {
  return ICONS[name] || '';
}

/* ---------- Tile illustrations (120 x 120) ---------- */

function familyArt() {
  return [
    line('M44,20 L60,8 L76,20', C.ink, 2.6),
    fill(circ(60, 8, 2.6), C.ink),
    shape(rrect(14, 20, 92, 80, 12), C.card),
    fill(rrect(22, 28, 76, 64, 7), C.clayTint),
    fill(circ(86, 42, 6), C.gold),
    shape('M28,92 C28,76 37,69 47,69 C57,69 66,76 66,92 Z', C.clay),
    shape(circ(47, 56, 10), C.skin),
    shape('M58,92 C58,80 65,75 74,75 C83,75 90,80 90,92 Z', C.sky),
    shape(circ(74, 63, 8.5), C.skin2),
    shape('M101,27 C93,21 90,15 94,11.5 C97,9 100.5,10.5 101,14 C101.5,10.5 105,9 108,11.5 C112,15 109,21 101,27 Z', C.clay, 2.6),
  ].join('');
}

function radioArt() {
  return [
    fill(circ(20, 30, 3.8), C.sky),
    fill(circ(29, 27, 3.8), C.sky),
    line('M23.5,30 V14.5 L32.5,12 V27', C.ink, 2.6),
    line('M34,42 C34,23 86,23 86,42', C.ink, 4),
    line('M92,41 L107,15', C.ink, 2.8),
    fill(circ(107.5, 14, 3.2), C.ink),
    shape(rrect(14, 40, 92, 62, 16), '#e9c9a0'),
    fill(rrect(22, 48, 76, 46, 10), C.kraftSoft),
    shape(circ(46, 71, 17), C.clay),
    line(circ(46, 71, 11), C.ink, 2),
    line(circ(46, 71, 5), C.ink, 2),
    shape(rrect(70, 56, 22, 11, 3), C.card, 2.6),
    line('M79,57.5 V65.5', C.clayDeep, 2.4),
    shape(circ(74.5, 82, 5), C.sky, 2.6),
    shape(circ(88.5, 82, 5), C.sage, 2.6),
  ].join('');
}

function domeArt() {
  return [
    fill(circ(60, 56, 44), C.sageTint),
    fill(sparkle(101, 26, 8), C.gold),
    fill(sparkle(20, 34, 6), C.gold),
    shape(rrect(11, 52, 9, 52, 2), '#e3dacc', 2.6),
    shape('M10.5,52.5 L15.5,40 L20.5,52.5 Z', C.sage, 2.6),
    shape(rrect(22, 76, 76, 28, 4), C.manilla),
    shape('M30,104 V94 a5,5 0 0 1 10,0 V104', C.card, 2.6),
    shape('M55,104 V92 a5,5 0 0 1 10,0 V104', C.card, 2.6),
    shape('M80,104 V94 a5,5 0 0 1 10,0 V104', C.card, 2.6),
    shape(rrect(34, 66, 52, 11, 3), '#e3dacc'),
    shape('M34,66 C34,44 44,32 60,24 C76,32 86,44 86,66 Z', C.sage),
    line('M44.5,58 C45.5,47 50,40 56,35', '#b8c79f', 3),
    line('M60,24 V15', C.ink, 2.6),
    shape('M57.2,5.2 A6,6 0 1,0 65.2,12.8 A4.8,4.8 0 1,1 57.2,5.2 Z', C.gold, 2.2),
  ].join('');
}

function ludoArt() {
  const corner = (x, y, color) => shape(rrect(x, y, 34, 34, 6), color, 2.6)
    + fill(rrect(x + 7, y + 7, 20, 20, 5), C.card)
    + fill(circ(x + 13, y + 13, 3.2), color) + fill(circ(x + 21, y + 21, 3.2), color);
  return [
    shape(rrect(12, 12, 96, 96, 12), C.card),
    corner(17, 17, C.clay),
    corner(69, 17, C.sage),
    corner(69, 69, C.gold),
    corner(17, 69, C.sky),
    fill('M51,51 L69,51 L60,60 Z', C.sage),
    fill('M69,51 L69,69 L60,60 Z', C.gold),
    fill('M69,69 L51,69 L60,60 Z', C.sky),
    fill('M51,69 L51,51 L60,60 Z', C.clay),
    fill('M57,17 H63 V51 H57 Z', C.sageSoft),
    fill('M69,57 H103 V63 H69 Z', '#f5e6bf'),
    fill('M57,69 H63 V103 H57 Z', C.skySoft),
    fill('M17,57 H51 V63 H17 Z', C.claySoft),
    `<g transform="rotate(14 90 93)">${shape(rrect(75, 78, 30, 30, 7), C.card, 2.8)}${fill(circ(83, 86, 2.8), C.ink)}${fill(circ(90, 93, 2.8), C.ink)}${fill(circ(97, 100, 2.8), C.ink)}</g>`,
  ].join('');
}

function beadsArt() {
  const cx = 60;
  const cy = 47;
  const rx = 33;
  const ry = 31;
  const beads = [];
  const n = 17;
  const gap = 0.42;
  for (let i = 0; i < n; i += 1) {
    const tt = Math.PI + gap + (i * (2 * Math.PI - 2 * gap)) / (n - 1);
    const x = cx + rx * Math.sin(tt);
    const y = cy - ry * Math.cos(tt);
    beads.push(shape(circ(+x.toFixed(2), +y.toFixed(2), 5.2), i % 4 === 0 ? C.clay : C.kraft, 2.2));
  }
  return [
    fill(circ(60, 58, 46), C.manilla + '66'),
    line(`M${cx - 11},${cy + ry - 3} C${cx - 50},${cy + 10} ${cx - 40},${cy - ry - 6} ${cx},${cy - ry} C${cx + 40},${cy - ry - 6} ${cx + 50},${cy + 10} ${cx + 11},${cy + ry - 3}`, C.ink, 1.8),
    ...beads,
    line(`M${cx - 11},${cy + ry - 3} L${cx},${cy + ry + 6} L${cx + 11},${cy + ry - 3}`, C.ink, 1.8),
    shape(circ(cx, cy + ry + 9, 6.5), C.sage, 2.4),
    shape(`M${cx - 6},${cy + ry + 16} H${cx + 6} L${cx + 10},${cy + ry + 36} H${cx - 10} Z`, C.clay, 2.4),
    line(`M${cx - 3},${cy + ry + 21} L${cx - 5},${cy + ry + 34} M${cx + 3},${cy + ry + 21} L${cx + 5},${cy + ry + 34}`, C.clayDeep, 1.8),
  ].join('');
}

function relaxArt() {
  return [
    fill(circ(60, 60, 48), C.skyTint),
    line(circ(60, 60, 48), '#bcd3ea', 2.4),
    fill(circ(60, 60, 34), C.skySoft),
    line(circ(60, 60, 34), '#a9c5e2', 2.4),
    shape(circ(60, 60, 21), C.sky),
    fill('M60,48 C69,53 70,64 60,72 C50,64 51,53 60,48 Z', C.card),
    line('M60,52 V70', C.sky, 2),
    line('M8,34 C18,30 24,38 34,33', C.ink, 2.6),
    line('M88,92 C98,88 104,96 114,90', C.ink, 2.6),
    fill(sparkle(98, 26, 7), C.gold),
  ].join('');
}

function paletteArt() {
  return [
    shape('M58,16 C86,15 106,33 106,56 C106,72 97,79 87,77 C79,76 74,81 76,89 C78,99 70,104 58,104 C32,104 14,84 14,60 C14,35 32,17 58,16 Z', C.manilla),
    shape(circ(35, 47, 8.5), C.clay, 2.6),
    shape(circ(56, 33, 8.5), C.gold, 2.6),
    shape(circ(80, 38, 8.5), C.sky, 2.6),
    shape(circ(31, 72, 8.5), C.sage, 2.6),
    shape(circ(52, 88, 8), C.rose, 2.6),
    `<g transform="rotate(40 88 70)">${shape(rrect(84, 42, 9, 40, 4), C.kraft, 2.6)}${shape(rrect(83, 80, 11, 8, 2), C.mid, 2.4)}${shape('M83.5,88 H93.5 C93.5,98 90.5,103 88.5,106 C86.5,103 83.5,98 83.5,88 Z', C.clay, 2.6)}</g>`,
  ].join('');
}

function birdArt() {
  return [
    line('M8,93 C38,86 78,93 112,84', C.ink, 4),
    shape('M92,86 C96,78 104,76 110,78 C106,84 100,88 92,86 Z', C.sage, 2.4),
    shape('M20,91 C22,84 28,81 34,82 C32,88 27,91 20,91 Z', C.sage, 2.4),
    shape('M30,78 L13,88 L19,74 Z', C.skyDeep, 2.6),
    shape('M28,72 C28,55 42,44 58,44 C70,44 78,52 79,62 C79,77 67,87 52,87 C38,87 28,82 28,72 Z', C.sky),
    shape('M55,45 C55,37 59,32 65,30 C65,36 65,41 62,46 Z', C.skyDeep, 2.6),
    shape('M38,69 C46,60 60,61 66,70 C58,77 46,78 38,69 Z', C.skyDeep, 2.6),
    shape('M78,55 L92,52 L80,62 Z', C.gold, 2.6),
    fill(circ(68, 53, 2.8), C.ink),
    fill(circ(70, 68, 3.2), C.clay),
    fill(circ(96, 40, 3.8), C.clay),
    fill(circ(106, 36, 3.8), C.clay),
    line('M99.5,40 V23 L109.5,20 V36', C.ink, 2.4),
    fill(circ(86, 22, 3.2), C.gold),
    line('M89,22 V9', C.ink, 2.2),
  ].join('');
}

function facesArt() {
  return [
    `<g transform="rotate(-6 50 60)">`,
    shape(rrect(16, 18, 64, 82, 9), C.card),
    fill(rrect(22, 24, 52, 58, 6), C.clayTint),
    shape('M32,82 C32,68 40,62 48,62 C56,62 64,68 64,82 Z', C.clay),
    shape(circ(48, 47, 9.5), C.skin),
    line('M28,91 H56', C.mid, 3),
    `</g>`,
    shape('M88,20 C99.5,20 107,28.5 107,39 C107,49.5 99.5,58 88,58 C85,58 82,57.4 79.4,56.2 L69,62 L72.6,51.6 C70.6,48.2 69.4,43.8 69.4,39 C69.4,28.5 76.8,20 88,20 Z', C.skySoft),
    line('M81.6,33.8 C81.6,28.2 94.4,28 94.4,34.6 C94.4,39.8 88,40.2 88,45.4', C.clayDeep, 4),
    fill(circ(88, 51.4, 2.6), C.clayDeep),
  ].join('');
}

function cardsArt() {
  return [
    `<g transform="rotate(-10 39 58)">`,
    shape(rrect(16, 26, 46, 64, 9), C.clay),
    line(rrect(22, 32, 34, 52, 5), C.clayTint, 2.2),
    fill('M39,48 L46,58 L39,68 L32,58 Z', C.clayTint),
    `</g>`,
    `<g transform="rotate(8 79 56)">`,
    shape(rrect(56, 24, 46, 64, 9), C.card),
    line('M79,62 V76', C.sage, 3),
    shape('M79,70 C84,64 90,65 92,68 C88,73 83,73 79,70 Z', C.sage, 2.2),
    ...[0, 1, 2, 3, 4].map((k) => {
      const a = (-90 + k * 72) * (Math.PI / 180);
      return shape(circ(+(79 + 7 * Math.cos(a)).toFixed(2), +(50 + 7 * Math.sin(a)).toFixed(2), 5.6), C.rose, 2.2);
    }),
    shape(circ(79, 50, 4.4), C.gold, 2.2),
    `</g>`,
    fill(sparkle(58, 100, 6), C.gold),
  ].join('');
}

function bubblesArt() {
  const bubble = (cx, cy, r, tint, edge) => fill(circ(cx, cy, r), tint)
    + line(circ(cx, cy, r), edge, 3)
    + line(`M${cx - r * 0.62},${cy - r * 0.18} A${r * 0.66},${r * 0.66} 0 0 1 ${cx - r * 0.12},${cy - r * 0.64}`, '#ffffff', r > 20 ? 4.5 : 3);
  return [
    bubble(50, 66, 31, C.skyTint, C.sky),
    bubble(88, 38, 18, '#f4f1f9', C.lilac),
    bubble(93, 84, 12, C.clayTint, C.clay),
    bubble(24, 26, 8, C.sageTint, C.sage),
  ].join('');
}

function puzzleArt() {
  return [
    shape(rrect(12, 28, 74, 74, 11), C.skySoft),
    fill('M12.5,80 C28,66 50,66 85.5,77 V91 A10.5,10.5 0 0 1 75,101.5 H23 A10.5,10.5 0 0 1 12.5,91 Z', C.sage),
    line('M13,80 C28,66 50,66 85,77', C.ink, 2.6),
    fill(rrect(49, 28.5, 36.5, 36.5, 2), C.card),
    line('M49,29 V101', C.ink, 2),
    line('M13,65 H86', C.ink, 2),
    line(rrect(52, 32, 30, 30, 4), C.mid, 2),
    `<g transform="rotate(12 86 30)">`,
    fill(rrect(70, 16, 38, 38, 8), 'rgba(20,20,19,0.10)'),
    shape(rrect(66, 11, 38, 38, 8), C.skySoft),
    shape(circ(85, 30, 9.5), C.gold, 2.6),
    `</g>`,
    shape('M22,48 C22,43 26,40 30,41 C32,37 38,37 40,41 C44,41 46,45 44,48 Z', C.card, 2.4),
  ].join('');
}

function logoArt() {
  return [
    shape(rrect(8, 8, 104, 104, 26), C.card, 4),
    `<clipPath id="logo-win"><path d="${rrect(20, 20, 80, 64, 14)}"/></clipPath>`,
    `<g clip-path="url(#logo-win)">`,
    fill(rrect(20, 20, 80, 64, 14), C.clayTint),
    fill(circ(60, 72, 20), C.clay),
    fill('M16,80 C36,64 62,62 104,76 V90 H16 Z', C.sage),
    line('M16,79.5 C36,63.5 62,61.5 104,75.5', C.ink, 3),
    `</g>`,
    line(rrect(20, 20, 80, 64, 14), C.ink, 3),
    shape('M60,105 C53,100 49,96 51,92 C52.5,89.5 56,89.5 60,93 C64,89.5 67.5,89.5 69,92 C71,96 67,100 60,105 Z', C.clay, 2.4),
  ].join('');
}

export const ART = {
  family: familyArt,
  songs: radioArt,
  naats: domeArt,
  games: ludoArt,
  tasbeeh: beadsArt,
  relax: relaxArt,
  coloring: paletteArt,
  sing: birdArt,
  faces: facesArt,
  memory: cardsArt,
  bubbles: bubblesArt,
  puzzle: puzzleArt,
  logo: logoArt,
};

export function art(name, cls = 'draw-in') {
  const fn = ART[name];
  return fn ? svg(fn(), '0 0 120 120', cls) : '';
}

/* The burst shown with praise. */
export function burstArt() {
  const colors = [C.clay, C.sky, C.sage, C.gold];
  const rays = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (i * 30 * Math.PI) / 180;
    const r1 = 42;
    const r2 = i % 2 ? 54 : 62;
    rays.push(`<path class="ray" style="animation-delay:${i * 30}ms" d="M${(66 + r1 * Math.cos(a)).toFixed(1)},${(66 + r1 * Math.sin(a)).toFixed(1)} L${(66 + r2 * Math.cos(a)).toFixed(1)},${(66 + r2 * Math.sin(a)).toFixed(1)}" stroke="${colors[i % 4]}" stroke-width="6" stroke-linecap="round"/>`);
  }
  return svg(
    `${rays.join('')}<g class="core"><path d="${starPath(66, 66, 34, 15)}" fill="${C.gold}" stroke="${C.ink}" stroke-width="3.2" stroke-linejoin="round"/></g>`,
    '0 0 132 132',
    'star-burst',
  );
}

export { shape, line, fill };
