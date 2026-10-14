import {canonicalJson, verifyReviewPacket, type ReviewPacket} from './contentReview';

const pathLimit = 200;
const keyOf = (item: ReviewPacket['items'][number]) => `${item.kind}:${item.id}`;
const escapePointer = (key: string) => key.replaceAll('~', '~0').replaceAll('/', '~1');

// JSON Pointer : les tableaux sont comparés par position, sans interprétation médicale.
function changedPaths(before: unknown, after: unknown) {
  const paths: string[] = [];
  let truncated = false;
  const walk = (left: unknown, right: unknown, path: string) => {
    if (canonicalJson(left) === canonicalJson(right)) return;
    if (paths.length >= pathLimit) { truncated = true; return; }
    if (left !== null && right !== null && typeof left === 'object' && typeof right === 'object'
      && Array.isArray(left) === Array.isArray(right)) {
      const a = left as Record<string, unknown>, b = right as Record<string, unknown>;
      for (const key of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
        const child = `${path}/${escapePointer(key)}`;
        if (!Object.hasOwn(a, key) || !Object.hasOwn(b, key)) {
          if (paths.length < pathLimit) paths.push(child); else truncated = true;
        } else walk(a[key], b[key], child);
      }
    } else paths.push(path);
  };
  walk(before, after, '');
  return {paths, truncated};
}

export async function compareReviewPackets(beforeRaw: unknown, afterRaw: unknown, cryptoApi: Crypto = globalThis.crypto) {
  const before = await verifyReviewPacket(beforeRaw, cryptoApi);
  const after = await verifyReviewPacket(afterRaw, cryptoApi);
  const previous = new Map(before.items.map(item => [keyOf(item), item]));
  const current = new Map(after.items.map(item => [keyOf(item), item]));
  const added = after.items.filter(item => !previous.has(keyOf(item))).map(({kind, id, contentHash}) => ({kind, id, contentHash}));
  const removed = before.items.filter(item => !current.has(keyOf(item))).map(({kind, id, contentHash}) => ({kind, id, contentHash}));
  const modified = after.items.flatMap(item => {
    const old = previous.get(keyOf(item));
    return !old || old.contentHash === item.contentHash ? [] : [{kind: item.kind, id: item.id,
      beforeHash: old.contentHash, afterHash: item.contentHash, ...changedPaths(old.content, item.content)}];
  });
  return {schemaVersion: 1 as const, beforeHash: before.packetHash, afterHash: after.packetHash,
    beforeVersion: before.contentVersion, afterVersion: after.contentVersion,
    versionChanged: before.contentVersion !== after.contentVersion,
    orderChanged: canonicalJson(before.items.map(keyOf)) !== canonicalJson(after.items.map(keyOf)),
    added, removed, modified, unchanged: after.items.length - added.length - modified.length,
    notice: 'Différences documentaires uniquement. Les chemins utilisent JSON Pointer ; listes comparées par position, 200 chemins maximum par élément. Aucune validation médicale ni modification de contenu. Les métadonnées supplémentaires du dossier, dont le registre des sources, ne sont pas couvertes par ces empreintes.'};
}
