// Colouring pages. Each region is one tappable shape; regions are listed back to
// front. `preset` colours are used for thumbnails and for the picture puzzle.
import { circ, ell, rrect, starPath } from '../core/art.js';

export const PALETTE = [
  { key: 'red', hex: '#d64545' },
  { key: 'orange', hex: '#ec8a54' },
  { key: 'yellow', hex: '#f2c14e' },
  { key: 'leaf', hex: '#a5c96f' },
  { key: 'green', hex: '#5c9a5a' },
  { key: 'sky', hex: '#8ec5ea' },
  { key: 'blue', hex: '#4a7fc1' },
  { key: 'purple', hex: '#8e72c4' },
  { key: 'pink', hex: '#ef9ab0' },
  { key: 'brown', hex: '#9a6b4b' },
  { key: 'cream', hex: '#f5e6c8' },
  { key: 'white', hex: '#ffffff' },
];

const R = (id, d, preset, extra = {}) => ({ id, d, preset, ...extra });
const poly = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

/* A crescent: the part of circle 1 outside circle 2. */
function crescent(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const hh = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const mx = x1 + (a * dx) / d;
  const my = y1 + (a * dy) / d;
  const p1 = [mx + (hh * dy) / d, my - (hh * dx) / d];
  const p2 = [mx - (hh * dy) / d, my + (hh * dx) / d];
  const f = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  return `M${f(p1)}A${r1},${r1} 0 1,0 ${f(p2)}A${r2},${r2} 0 0,1 ${f(p1)}Z`;
}

const FULL = 'M0,0H600V600H0Z';

function flower() {
  const petals = Array.from({ length: 8 }, (_, k) => R(`petal${k}`, ell(300, 88, 25, 54), k % 2 ? '#f2c14e' : '#ec8a54', { transform: `rotate(${k * 45} 300 168)` }));
  return {
    id: 'flower',
    nameKey: 'page.flower',
    regions: [
      R('sky', FULL, '#eaf4fb'),
      R('table', 'M0,500H600V600H0Z', '#c89f7c'),
      R('sun', circ(92, 92, 54), '#f2c14e'),
      R('stem', 'M292,362V200H308V362Z', '#5c9a5a'),
      R('leafL', 'M292,356C264,356 230,342 206,312C246,300 280,318 292,336Z', '#a5c96f'),
      R('leafR', 'M308,338C336,338 370,324 394,294C354,282 320,300 308,318Z', '#a5c96f'),
      R('pot', 'M196,402H404L380,548Q378,560 366,560H234Q222,560 220,548Z', '#d9794f'),
      R('band', 'M199,430H401L397,456H203Z', '#f5e6c8'),
      R('rim', rrect(178, 360, 244, 44, 14), '#c4623f'),
      ...petals,
      R('center', circ(300, 168, 52), '#9a6b4b'),
    ],
    details: ['M292,346C270,338 248,326 230,312', 'M308,328C330,320 352,308 370,296',
      circ(286, 156, 6), circ(314, 158, 6), circ(300, 184, 6), circ(281, 181, 5), circ(319, 181, 5)],
  };
}

function mosque() {
  return {
    id: 'mosque',
    nameKey: 'page.mosque',
    regions: [
      R('sky', FULL, '#dbe7f3'),
      R('moon', crescent(470, 104, 50, 494, 88, 42), '#f2c14e'),
      R('star1', starPath(96, 92, 22, 9, 5), '#f2c14e'),
      R('star2', starPath(186, 58, 14, 6, 5), '#f5e6c8'),
      R('star3', starPath(384, 70, 13, 5.5, 5), '#f5e6c8'),
      R('ground', 'M0,520H600V600H0Z', '#a5c96f'),
      R('minL', rrect(70, 250, 56, 272, 6), '#f5e6c8'),
      R('minR', rrect(474, 250, 56, 272, 6), '#f5e6c8'),
      R('capL', 'M64,254C64,214 86,196 98,172C110,196 132,214 132,254Z', '#5c9a5a'),
      R('capR', 'M468,254C468,214 490,196 502,172C514,196 536,214 536,254Z', '#5c9a5a'),
      R('balL', rrect(58, 330, 80, 20, 7), '#c89f7c'),
      R('balR', rrect(462, 330, 80, 20, 7), '#c89f7c'),
      R('winML', rrect(86, 384, 24, 46, 12), '#4a7fc1'),
      R('winMR', rrect(490, 384, 24, 46, 12), '#4a7fc1'),
      R('dome', 'M188,334C188,246 244,214 300,168C356,214 412,246 412,334Z', '#5c9a5a'),
      R('finial', circ(300, 157, 12), '#f2c14e'),
      R('hall', rrect(150, 330, 300, 192, 8), '#f5e6c8'),
      R('drum', rrect(176, 320, 248, 24, 8), '#c89f7c'),
      R('winL', 'M184,472V424A23,23 0 0,1 230,424V472Z', '#4a7fc1'),
      R('winR', 'M370,472V424A23,23 0 0,1 416,424V472Z', '#4a7fc1'),
      R('door', 'M260,522V446A40,40 0 0,1 340,446V522Z', '#9a6b4b'),
    ],
    details: ['M300,446V522'],
  };
}

function butterfly() {
  return {
    id: 'butterfly',
    nameKey: 'page.butterfly',
    regions: [
      R('sky', FULL, '#fdf3e7'),
      R('grass', 'M0,540C100,520 200,532 300,522C400,512 500,526 600,516V600H0Z', '#a5c96f'),
      R('flower1', circ(90, 520, 22), '#ef9ab0'),
      R('flower2', circ(520, 512, 18), '#f2c14e'),
      R('wingUL', 'M292,252C240,120 108,88 96,176C84,254 170,300 292,286Z', '#ec8a54'),
      R('wingUR', 'M308,252C360,120 492,88 504,176C516,254 430,300 308,286Z', '#ec8a54'),
      R('wingLL', 'M292,300C210,300 138,352 166,428C194,496 270,440 292,336Z', '#8e72c4'),
      R('wingLR', 'M308,300C390,300 462,352 434,428C406,496 330,440 308,336Z', '#8e72c4'),
      R('spotUL', circ(178, 192, 30), '#f2c14e'),
      R('spotUR', circ(422, 192, 30), '#f2c14e'),
      R('spotUL2', circ(128, 222, 13), '#f5e6c8'),
      R('spotUR2', circ(472, 222, 13), '#f5e6c8'),
      R('spotLL', circ(214, 386, 22), '#ef9ab0'),
      R('spotLR', circ(386, 386, 22), '#ef9ab0'),
      R('body', ell(300, 312, 18, 96), '#9a6b4b'),
      R('head', circ(300, 196, 24), '#9a6b4b'),
      R('antL', circ(252, 118, 11), '#d64545'),
      R('antR', circ(348, 118, 11), '#d64545'),
    ],
    details: ['M292,178C282,152 268,132 258,124', 'M308,178C318,152 332,132 342,124', 'M285,300H315', 'M285,330H315', 'M287,360H313', 'M90,542V560', 'M520,530V556'],
  };
}

function kite() {
  return {
    id: 'kite',
    nameKey: 'page.kite',
    regions: [
      R('sky', FULL, '#dbe7f3'),
      R('sun', circ(520, 88, 46), '#f2c14e'),
      R('cloud1', 'M44,470C44,440 76,428 98,440C106,412 152,408 164,436C190,430 212,448 206,470Z', '#ffffff'),
      R('cloud2', 'M388,560C388,536 414,526 432,536C440,514 476,512 486,534C508,530 524,544 520,560Z', '#ffffff'),
      R('q1', 'M300,70L300,250L130,250Z', '#d64545'),
      R('q2', 'M300,70L470,250L300,250Z', '#f2c14e'),
      R('q3', 'M300,250L470,250L300,430Z', '#d64545'),
      R('q4', 'M300,250L300,430L130,250Z', '#f2c14e'),
      R('moon', circ(300, 250, 28), '#ffffff'),
      R('tail', 'M300,430L264,484L336,484Z', '#4a7fc1'),
      R('bow1', 'M270,534L248,520L248,548ZM270,534L292,520L292,548Z', '#5c9a5a'),
      R('bow2', 'M232,572L210,558L210,586ZM232,572L254,558L254,586Z', '#8e72c4'),
    ],
    details: ['M300,484C296,508 284,522 270,534C258,546 244,560 232,572C222,582 212,592 204,600', 'M300,70V430', 'M130,250H470'],
  };
}

function tea() {
  return {
    id: 'tea',
    nameKey: 'page.tea',
    regions: [
      R('wall', FULL, '#fdf3e7'),
      R('table', 'M0,470H600V600H0Z', '#c89f7c'),
      R('saucer', ell(300, 486, 204, 44), '#f5e6c8'),
      R('handle', 'M446,326C522,314 528,418 432,420L438,392C488,390 488,346 444,354Z', '#4a7fc1'),
      R('cup', 'M150,300H450C450,400 400,462 300,462C200,462 150,400 150,300Z', '#ffffff'),
      R('band', 'M153,340H447L439,372H161Z', '#4a7fc1'),
      R('tea', ell(300, 300, 146, 24), '#c07a45'),
      R('rusk', rrect(438, 430, 98, 48, 16), '#e3b86b', { transform: 'rotate(-10 487 454)' }),
      R('flowerDot', circ(300, 410, 18), '#ef9ab0'),
    ],
    details: ['M250,268C236,244 264,228 250,202', 'M300,262C286,238 314,222 300,192', 'M350,268C336,244 364,228 350,202'],
  };
}

function fish() {
  return {
    id: 'fish',
    nameKey: 'page.fish',
    regions: [
      R('water', FULL, '#8ec5ea'),
      R('sand', 'M0,530C120,510 220,540 320,524C420,508 520,530 600,520V600H0Z', '#f5e6c8'),
      R('weedL', 'M88,540C68,480 108,450 88,390C120,440 110,490 118,540Z', '#5c9a5a'),
      R('weedR', 'M520,535C500,470 540,440 520,380C552,430 540,480 548,535Z', '#5c9a5a'),
      R('bubble1', circ(96, 190, 16), '#ffffff'),
      R('bubble2', circ(68, 138, 11), '#ffffff'),
      R('bubble3', circ(108, 96, 8), '#ffffff'),
      R('tail', 'M430,300L540,212C520,262 520,338 540,388Z', '#ec8a54'),
      R('finTop', 'M234,214C262,148 346,144 374,214Z', '#ec8a54'),
      R('finBottom', 'M262,382C280,432 330,438 350,380Z', '#ec8a54'),
      R('body', 'M110,300C160,184 370,184 440,300C370,416 160,416 110,300Z', '#f2c14e'),
      R('stripe1', 'M262,215C282,260 282,340 262,385L292,387C312,340 312,260 292,213Z', '#ec8a54'),
      R('stripe2', 'M338,224C356,262 356,338 338,376L366,368C382,334 382,266 366,232Z', '#ec8a54'),
      R('finSide', 'M248,316C268,354 314,358 322,326C300,306 268,302 248,316Z', '#d64545'),
      R('eye', circ(190, 276, 22), '#ffffff'),
      R('pupil', circ(194, 277, 10), '#141413'),
    ],
    details: ['M118,302C126,310 134,314 144,314'],
  };
}

function house() {
  return {
    id: 'house',
    nameKey: 'page.house',
    regions: [
      R('sky', FULL, '#dbe7f3'),
      R('sun', circ(88, 88, 50), '#f2c14e'),
      R('cloud', 'M380,122C380,98 406,86 426,96C434,72 474,68 488,92C512,88 532,104 528,122Z', '#ffffff'),
      R('grass', 'M0,470C150,440 300,460 450,445C520,438 570,450 600,445V600H0Z', '#a5c96f'),
      R('path', 'M264,600L286,500H334L356,600Z', '#f5e6c8'),
      R('chimney', rrect(350, 196, 34, 76, 4), '#9a6b4b'),
      R('wall', rrect(150, 300, 280, 200, 4), '#f5e6c8'),
      R('roof', 'M124,308L290,174L456,308Z', '#d64545'),
      R('roundWin', circ(290, 250, 22), '#8ec5ea'),
      R('door', 'M262,500V412A28,28 0 0,1 318,412V500Z', '#9a6b4b'),
      R('winL', rrect(176, 348, 62, 62, 6), '#8ec5ea'),
      R('winR', rrect(342, 348, 62, 62, 6), '#8ec5ea'),
      R('trunk', rrect(480, 368, 28, 140, 6), '#9a6b4b'),
      R('tree', 'M494,392C440,394 426,330 462,312C452,270 500,250 522,276C556,262 586,300 564,330C592,362 554,398 494,392Z', '#5c9a5a'),
    ],
    details: ['M207,348V410M176,379H238', 'M373,348V410M342,379H404', circ(306, 458, 4)],
  };
}

function star() {
  const cx = 300;
  const cy = 300;
  const outer = 212;
  const inner = 162.4;
  const innerPts = Array.from({ length: 8 }, (_, k) => polar(cx, cy, inner, -67.5 + k * 45));
  const outerPts = Array.from({ length: 8 }, (_, k) => polar(cx, cy, outer, -45 + k * 45));
  const points = outerPts.map((p, k) => R(`point${k}`, poly([innerPts[k], p, innerPts[(k + 1) % 8]]), k % 2 ? '#4a7fc1' : '#5c9a5a'));
  const dots = Array.from({ length: 8 }, (_, k) => {
    const [x, y] = polar(cx, cy, 206, -67.5 + k * 45);
    return R(`dot${k}`, circ(+x.toFixed(1), +y.toFixed(1), 17), '#f2c14e');
  });
  return {
    id: 'star',
    nameKey: 'page.star',
    regions: [
      R('bg', FULL, '#fdf3e7'),
      R('rim', circ(cx, cy, 264), '#4a7fc1'),
      R('field', circ(cx, cy, 238), '#f5e6c8'),
      ...dots,
      ...points,
      R('core', poly(innerPts), '#f5e6c8'),
      R('ring', circ(cx, cy, 96), '#d64545'),
      R('inner', starPath(cx, cy, 86, 50, 8, -90), '#f2c14e'),
      R('eye', circ(cx, cy, 30), '#5c9a5a'),
    ],
    details: [],
  };
}

export const PAGES = [flower(), mosque(), butterfly(), kite(), tea(), fish(), house(), star()];

export function pageById(id) {
  return PAGES.find((p) => p.id === id) || null;
}

const STROKE = '#141413';

/* A complete SVG string, coloured with `fills` (or the preset colours). */
export function pageSVG(page, fills = null, { strokeWidth = 6, usePreset = false } = {}) {
  const shapes = page.regions.map((r) => {
    const color = (fills && fills[r.id]) || (usePreset ? r.preset : '#ffffff');
    return `<path d="${r.d}" fill="${color}"${r.transform ? ` transform="${r.transform}"` : ''}/>`;
  }).join('');
  const lines = page.regions.map((r) => `<path d="${r.d}"${r.transform ? ` transform="${r.transform}"` : ''}/>`).join('')
    + page.details.map((d) => `<path d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">${shapes}`
    + `<g fill="none" stroke="${STROKE}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${lines}</g></svg>`;
}
