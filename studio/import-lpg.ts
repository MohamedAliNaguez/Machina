import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, basename } from 'node:path';
import { getCliClient } from 'sanity/cli';
import { repositoryContent } from '../src/data/repository';
import { prepareSanitySeed, productDocumentId } from '../scripts/lib/sanity-seed';
import type { Machine } from '../src/lib/types';

const stripKeys = (value: any): any =>
  Array.isArray(value)
    ? value.map(stripKeys)
    : value && typeof value === 'object'
      ? Object.fromEntries(
          Object.entries(value)
            .filter(([key]) => !key.startsWith('_'))
            .map(([key, item]) => [key, stripKeys(item)]),
        )
      : value;
const equal = (a: unknown, b: unknown) =>
  JSON.stringify(stripKeys(a)) === JSON.stringify(stripKeys(b));

async function main() {
  const root = resolve(process.cwd(), '..');
  const products: Machine[] = JSON.parse(
    await readFile(resolve(root, '.local/lpg-import/prepared-products.json'), 'utf8'),
  );
  const baseline: Machine[] = JSON.parse(
    await readFile(resolve(root, '.local/lpg-import/catalogue-before.json'), 'utf8'),
  );
  if (
    products.length !== 7 ||
    products.some(
      (p) => p.categoryId !== 'lpg-catalog' || !p.sample || p.technicalReview !== 'pending',
    )
  )
    throw new Error('Invalid reviewed LPG import manifest.');
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const ids = products.flatMap((p) => [
    productDocumentId(p.id),
    `drafts.${productDocumentId(p.id)}`,
  ]);
  const existing = await client.fetch<any[]>('*[_id in $ids]', { ids }, { perspective: 'raw' });
  await mkdir(resolve(root, '.local/sanity'), { recursive: true });
  await writeFile(
    resolve(root, `.local/sanity/lpg-before-${Date.now()}.json`),
    JSON.stringify(existing, null, 2),
  );
  const eligible = products.filter((p) => {
    const id = productDocumentId(p.id),
      current = existing.find((d) => d._id === id);
    const protectedRecord =
      existing.some((d) => d._id === `drafts.${id}`) ||
      (current && (!current.sample || current.technicalReview === 'approved'));
    if (protectedRecord) console.log(`Preserved draft or reviewed product: ${p.id}`);
    return !protectedRecord;
  });
  const uploads = new Map<string, Promise<string>>();
  let queue = Promise.resolve();
  const docs = await prepareSanitySeed(
    { ...repositoryContent, machines: eligible, categories: [], articles: [] },
    (src, type) => {
      if (!uploads.has(src)) {
        const operation = queue.then(async () => {
          if (!src.startsWith('/images/products/lpg/')) throw new Error('Unexpected import asset.');
          const base = resolve(root, 'public'),
            target = resolve(base, src.slice(1)),
            path = relative(base, target);
          if (path.startsWith('..') || isAbsolute(path)) throw new Error('Unsafe asset path.');
          const asset = await client.assets.upload(type, await readFile(target), {
            filename: basename(target),
            extract: [],
          });
          return asset._id;
        });
        queue = operation.then(() => undefined);
        uploads.set(src, operation);
      }
      return uploads.get(src)!;
    },
    new Set(['siteSettings']),
  );
  let transaction = client.transaction(),
    created = 0,
    enriched = 0;
  for (const doc of docs) {
    const current = existing.find((d) => d._id === doc._id);
    if (!current) {
      transaction = transaction.createIfNotExists(doc as any);
      created++;
      continue;
    }
    const original = baseline.find((p) => p.id === doc.id);
    if (!original) continue;
    const changes: Record<string, any> = {};
    for (const field of [
      'name',
      'model',
      'summary',
      'description',
      'applications',
      'specs',
      'source',
    ] as const)
      if (equal(current[field], original[field]) && !equal(current[field], doc[field]))
        changes[field] = doc[field];
    if (current.images?.length && current.images.every((image: any) => image.placeholder))
      changes.images = doc.images;
    if (Object.keys(changes).length) {
      transaction = transaction.patch(current._id, (patch) =>
        patch.ifRevisionId(current._rev).set(changes),
      );
      enriched++;
      console.log(`Enriching ${doc.id}: ${Object.keys(changes).join(', ')}`);
    }
  }
  if (created || enriched) await transaction.commit();
  console.log(
    `LPG import complete: ${created} new, ${enriched} existing products enriched. Editorial changes preserved.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
