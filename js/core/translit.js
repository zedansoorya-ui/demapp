// Memoni is written in Roman letters here (following Abdur Razzaq Thaplawala's
// "Memoni – A New Language is Born", 2005), but no computer voice speaks Memoni.
// A Hindi voice reads Devanagari phonetically, so we convert Roman Memoni into
// Devanagari for it. Capital N inside a word marks a nasal sound, as in the book.

const CONSONANTS = [
  ['chh', 'छ'], ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['jh', 'झ'], ['th', 'थ'],
  ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'], ['zh', 'झ'],
  ['k', 'क'], ['g', 'ग'], ['j', 'ज'], ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'],
  ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'],
  ['s', 'स'], ['h', 'ह'], ['z', 'ज़'], ['f', 'फ़'], ['q', 'क़'], ['c', 'स'], ['x', 'क्स'],
];

// [roman, standalone vowel, vowel sign after a consonant]
const VOWELS = [
  ['aa', 'आ', 'ा'], ['ae', 'ऐ', 'ै'], ['ai', 'ऐ', 'ै'], ['au', 'औ', 'ौ'], ['ee', 'ई', 'ी'], ['ii', 'ई', 'ी'],
  ['oo', 'ऊ', 'ू'], ['ou', 'औ', 'ौ'], ['a', 'अ', ''], ['e', 'ए', 'े'], ['i', 'इ', 'ि'],
  ['o', 'ओ', 'ो'], ['u', 'उ', 'ु'],
];

const VIRAMA = '्';

function convertWord(word) {
  const allCaps = word.length > 1 && word === word.toUpperCase();
  let out = '';
  let afterConsonant = false;
  let i = 0;
  while (i < word.length) {
    const ch = word[i];
    if (ch === 'N' && i > 0 && !allCaps) {
      out += 'ं';
      afterConsonant = false;
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '’') { i += 1; continue; }
    const rest = word.slice(i).toLowerCase();
    const vowel = VOWELS.find(([r]) => rest.startsWith(r));
    if (vowel) {
      out += afterConsonant ? vowel[2] : vowel[1];
      afterConsonant = false;
      i += vowel[0].length;
      continue;
    }
    const consonant = CONSONANTS.find(([r]) => rest.startsWith(r));
    if (consonant) {
      if (afterConsonant) out += VIRAMA;
      out += consonant[1];
      afterConsonant = true;
      i += consonant[0].length;
      continue;
    }
    out += ch;
    afterConsonant = false;
    i += 1;
  }
  return out;
}

export function toDevanagari(text) {
  if (!text) return '';
  return String(text).replace(/[A-Za-z'’]+/g, convertWord);
}

export function isLatin(text) {
  return /[A-Za-z]/.test(text || '');
}
