// Pictures for the matching game: familiar, everyday things.
import { C, circ, ell, rrect, starPath, svg, shape, line, fill } from '../core/art.js';

const DRAW = {
  mango: () => [
    shape('M60,26C86,24 100,46 98,70C96,94 78,106 58,104C36,102 22,86 24,64C26,40 40,28 60,26Z', '#f2b33d'),
    fill('M78,40C92,50 96,68 90,84C84,70 80,56 78,40Z', '#ec8a54'),
    line('M60,26C60,20 62,15 67,12', C.ink, 3),
    shape('M64,20C76,8 94,10 98,18C86,27 72,27 64,20Z', C.sage),
  ],
  tea: () => [
    shape(ell(60, 94, 44, 10), C.manilla),
    shape('M22,52H92C92,78 80,92 57,92C34,92 22,78 22,52Z', C.card),
    fill('M24,62H90L88,70H26Z', C.sky),
    shape(ell(57, 52, 35, 7), '#c07a45'),
    shape('M90,58C106,55 108,78 88,80L89,73C99,72 99,62 90,64Z', C.sky),
    line('M44,40C40,33 48,29 44,21', C.ink, 2.6),
    line('M58,38C54,31 62,27 58,19', C.ink, 2.6),
    line('M72,40C68,33 76,29 72,21', C.ink, 2.6),
  ],
  rose: () => [
    line('M60,62V108', C.sage, 5),
    shape('M60,88C48,84 40,86 34,94C44,98 54,96 60,88Z', C.sage, 2.6),
    shape('M60,80C72,76 80,78 86,86C76,90 66,88 60,80Z', C.sage, 2.6),
    shape(circ(60, 42, 26), '#d6536d'),
    line('M60,30C50,30 46,40 52,46C58,52 70,48 68,40C66,34 58,34 56,40', '#8f2a3f', 2.6),
    line('M40,50C44,60 54,64 62,64C72,64 80,58 82,48', '#8f2a3f', 2.6),
  ],
  moon: () => [
    fill(circ(60, 60, 50), C.skyTint),
    shape('M70,18A42,42 0 1,0 96,86A34,34 0 1,1 70,18Z', C.gold),
    shape(starPath(90, 36, 10, 4.2, 5), C.manilla, 2.4),
  ],
  kite: () => [
    shape('M60,12L60,62L24,62Z', C.clay),
    shape('M60,12L96,62L60,62Z', C.gold),
    shape('M60,62L96,62L60,104Z', C.gold),
    shape('M60,62L60,104L24,62Z', C.clay),
    line('M60,104C58,110 52,114 44,116', C.ink, 2.4),
    fill('M44,116L36,110L36,122Z', C.sky),
  ],
  bird: () => [
    line('M16,100H104', C.ink, 3.2),
    shape('M28,74L12,82L18,68Z', '#8a6446', 2.6),
    shape('M26,70C26,52 40,40 58,40C72,40 80,50 80,62C80,80 66,92 50,92C36,92 26,84 26,70Z', '#b88a5f'),
    fill('M52,70C58,78 70,78 76,70C72,86 58,90 50,86Z', C.manilla),
    shape('M34,66C42,56 56,58 60,68C52,74 42,76 34,66Z', '#8a6446', 2.6),
    shape('M79,54L92,58L80,64Z', C.gold, 2.6),
    fill(circ(68, 52, 3.2), C.ink),
    line('M44,92L42,100M56,92L56,100', C.ink, 2.6),
  ],
  fish: () => [
    fill(circ(60, 60, 50), C.skyTint),
    shape('M84,60L106,42C102,54 102,66 106,78Z', C.clay),
    shape('M18,60C30,36 70,34 86,60C70,86 30,84 18,60Z', C.sky),
    fill('M52,40C58,52 58,68 52,80L60,80C66,68 66,52 60,40Z', '#4a7fc1'),
    fill(circ(36, 56, 5), C.card),
    fill(circ(37, 56, 2.5), C.ink),
    line('M18,60C30,36 70,34 86,60C70,86 30,84 18,60Z', C.ink, 3.2),
  ],
  sun: () => [
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return line(`M${(60 + 34 * Math.cos(a)).toFixed(1)},${(60 + 34 * Math.sin(a)).toFixed(1)}L${(60 + 50 * Math.cos(a)).toFixed(1)},${(60 + 50 * Math.sin(a)).toFixed(1)}`, C.gold, 5);
    }),
    shape(circ(60, 60, 26), C.gold),
    fill(circ(52, 54, 6), '#f7d98a'),
  ],
  umbrella: () => [
    line('M60,56V98C60,108 48,108 48,98', C.ink, 4),
    shape('M14,58C16,30 38,14 60,14C82,14 104,30 106,58C98,52 90,52 82,58C74,52 68,52 60,58C52,52 46,52 38,58C30,52 22,52 14,58Z', C.clay),
    fill('M38,58C40,38 48,22 60,15C52,26 48,40 48,55Z', C.claySoft),
    fill('M82,58C80,38 72,22 60,15C68,26 72,40 72,55Z', C.claySoft),
    line('M60,14V8', C.ink, 3.2),
  ],
  lantern: () => [
    line('M44,26C44,10 76,10 76,26', C.ink, 3.2),
    shape(rrect(38, 24, 44, 10, 4), C.mid),
    shape('M40,34H80C90,48 90,78 80,90H40C30,78 30,48 40,34Z', '#fbe9b7'),
    shape('M60,50C68,60 68,72 60,80C52,72 52,60 60,50Z', C.clay, 2.6),
    fill('M60,62C63,67 63,72 60,76C57,72 57,67 60,62Z', C.gold),
    shape(rrect(34, 88, 52, 14, 5), C.mid),
    line('M40,34V90M80,34V90', C.ink, 2.4),
  ],
  house: () => [
    shape(rrect(26, 52, 68, 52, 3), C.manilla),
    shape('M18,56L60,20L102,56Z', C.clay),
    shape('M52,104V80A8,8 0 0,1 68,80V104Z', '#9a6b4b', 2.6),
    shape(rrect(32, 64, 16, 16, 3), C.sky, 2.6),
    shape(rrect(72, 64, 16, 16, 3), C.sky, 2.6),
  ],
  leaf: () => [
    shape('M22,98C18,56 46,22 98,20C100,70 70,100 22,98Z', C.sage),
    line('M22,98C44,76 66,52 92,26', '#3f5a2b', 3),
    line('M44,76L42,60M56,64L58,48M66,54L74,44M50,70L64,72M62,58L78,60', '#3f5a2b', 2.4),
  ],
};

export const THINGS = Object.keys(DRAW);

export function thingArt(name) {
  const fn = DRAW[name];
  return fn ? svg(fn().join(''), '0 0 120 120', '') : '';
}
