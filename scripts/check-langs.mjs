// Checks the language packs: every English key exists in Hindi and Urdu, placeholders
// match, and every Memoni phrase has a spoken (Devanagari) form.
import en from '../js/lang/en.js';
import hi from '../js/lang/hi.js';
import ur from '../js/lang/ur.js';
import mem from '../js/lang/mem.js';

let problems = 0;
const report = (msg) => { problems += 1; console.log('  ✗ ' + msg); };
const vars = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',');
const enKeys = Object.keys(en.strings);

for (const pack of [hi, ur]) {
  console.log(`${pack.meta.name}:`);
  for (const k of enKeys) {
    if (!(k in pack.strings)) report(`missing ${k}`);
    else if (vars(pack.strings[k]) !== vars(en.strings[k])) report(`placeholders differ in ${k}: "${pack.strings[k]}"`);
  }
  for (const k of Object.keys(pack.strings)) if (!(k in en.strings)) report(`extra key ${k}`);
}

console.log('Memoni:');
for (const k of Object.keys(mem.strings)) {
  if (!(k in en.strings)) report(`unknown key ${k}`);
  else if (vars(mem.strings[k]) !== vars(en.strings[k])) report(`placeholders differ in ${k}`);
  if (!(k in mem.speech)) report(`no spoken form for ${k}`);
  else if (vars(mem.speech[k]) !== vars(mem.strings[k])) report(`spoken placeholders differ in ${k}`);
}
for (const k of Object.keys(mem.speech)) if (!(k in mem.strings)) report(`spoken form without text: ${k}`);
const patientPrefixes = ['common.', 'greet.', 'time.', 'part.', 'day.', 'home.', 'family.', 'faces.', 'music.', 'games.', 'praise.', 'coloring.', 'page.', 'color.', 'sing.', 'memory.', 'thing.', 'bubbles.', 'puzzle.', 'tasbeeh.', 'dhikr.', 'breathe.'];
const untranslated = enKeys.filter((k) => patientPrefixes.some((p) => k.startsWith(p)) && !(k in mem.strings));
console.log(`  Memoni covers ${Object.keys(mem.strings).length} phrases; falls back to English for ${untranslated.length} patient-facing keys:`, untranslated.join(', ') || 'none');

console.log(problems ? `\n${problems} problem(s)` : '\nAll language packs are consistent.');
process.exit(problems ? 1 : 0);
