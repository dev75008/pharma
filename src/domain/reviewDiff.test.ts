import {expect, it} from 'vitest';
import {webcrypto} from 'node:crypto';
import {createReviewPacket, type ReviewEntry} from './contentReview';
import {compareReviewPackets} from './reviewDiff';
const cryptoApi = webcrypto as unknown as Crypto;
const entry = (id: string, content: unknown, kind: ReviewEntry['kind'] = 'drug'): ReviewEntry => ({kind, id, content});
const packet = (entries: ReviewEntry[], version = 'v1') => createReviewPacket(entries, version, cryptoApi);

it('compare les identités par type et id, sans dépendre de leur ordre', async () => {
  const a = await packet([entry('a', {value: 1}), entry('a', {value: 2}, 'question')]);
  const b = await packet([entry('a', {value: 2}, 'question'), entry('a', {value: 1})]);
  const diff = await compareReviewPackets(a, b, cryptoApi);
  expect(diff.unchanged).toBe(2); expect(diff.modified).toEqual([]); expect(diff.orderChanged).toBe(true);
});
it('distingue ajouts, retraits et changements de champ, source, correction et statut', async () => {
  const a = await packet([entry('a', {fields: {mechanism: {value: 'ancien', evidence: [{url: 'source-a'}]}}}), entry('retire', {})]);
  const b = await packet([entry('a', {fields: {mechanism: {value: 'nouveau', evidence: [{url: 'source-b'}]}}}), entry('ajout', {validationStatus: 'demo'})]);
  const diff = await compareReviewPackets(a, b, cryptoApi);
  expect(diff.added.map(i => i.id)).toEqual(['ajout']); expect(diff.removed.map(i => i.id)).toEqual(['retire']);
  expect(diff.modified[0].paths).toEqual(['/fields/mechanism/evidence/0/url', '/fields/mechanism/value']);
  const q = await packet([entry('q', {correct: true, validationStatus: 'demo'}, 'question')]);
  const changed = await packet([entry('q', {correct: false, validationStatus: 'reviewed'}, 'question')]);
  expect((await compareReviewPackets(q, changed, cryptoApi)).modified[0].paths).toEqual(['/correct', '/validationStatus']);
  expect(b.items[1].content).toEqual({validationStatus: 'demo'});
});
it('signale une version différente sans inventer de modifications de contenu', async () => {
  const diff = await compareReviewPackets(await packet([entry('a', {})]), await packet([entry('a', {})], 'v2'), cryptoApi);
  expect(diff.versionChanged).toBe(true); expect(diff.unchanged).toBe(1); expect(diff.modified).toEqual([]);
});
it('échappe les chemins et borne les détails sans perdre le nombre de contenus modifiés', async () => {
  const a = await packet([entry('a', {'a/b~c': 1}), entry('grand', Object.fromEntries(Array.from({length: 205}, (_, i) => [`k${i}`, 0])))]);
  const b = await packet([entry('a', {'a/b~c': 2}), entry('grand', Object.fromEntries(Array.from({length: 205}, (_, i) => [`k${i}`, 1])))]);
  const diff = await compareReviewPackets(a, b, cryptoApi);
  expect(diff.modified[0].paths).toEqual(['/a~1b~0c']); expect(diff.modified[1].paths).toHaveLength(200);
  expect(diff.modified[1].truncated).toBe(true); expect(diff.modified).toHaveLength(2);
});
it('refuse un dossier altéré avant de produire une comparaison', async () => {
  const a = await packet([entry('a', {value: 1})]);
  await expect(compareReviewPackets(a, {...a, items: [{...a.items[0], content: {value: 2}}]}, cryptoApi)).rejects.toThrow('altéré');
});
it('compare les clés JSON réservées et les ajouts/retraits dans les listes', async () => {
  const a = await packet([entry('a', JSON.parse('{"list":[1,2]}'))]);
  const b = await packet([entry('a', JSON.parse('{"__proto__":1,"list":[1]}'))]);
  expect((await compareReviewPackets(a, b, cryptoApi)).modified[0].paths).toEqual(['/__proto__', '/list/1']);
});
