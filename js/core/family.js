// Loved ones: their photos and the sound of their names.
import { db } from './store.js';
import { say, sayBlob } from './speech.js';

export async function getPeople({ withPhoto = false } = {}) {
  const all = await db.all('people');
  const list = all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.createdAt ?? 0) - (b.createdAt ?? 0));
  return withPhoto ? list.filter((p) => p.photo) : list;
}

/* "This is Zainab, your granddaughter." — in their own voice when we have it. */
export function introduce(person) {
  if (!person) return Promise.resolve();
  if (person.voice) return sayBlob(person.voice);
  if (person.relation) return say('family.thisIsRel', { name: person.name, relation: person.relation });
  return say('family.thisIs', { name: person.name });
}

/* The sound of their name, for the matching game. */
export function callName(person) {
  if (person.voice) return sayBlob(person.voice);
  return say('faces.where', { name: person.name });
}
