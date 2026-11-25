import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';
import { sanityContentQuery } from '../src/lib/sanity';
import { validateContent } from '../src/lib/content';
import type { Content } from '../src/lib/types';

const target = process.env.RECOVERY_DATASET;
if (!target || !/^seo-recovery-[a-z0-9-]+$/.test(target))
  throw new Error('Set an isolated RECOVERY_DATASET. Production cannot be a recovery target.');
const source = getCliClient({ apiVersion: '2025-02-19' }).withConfig({
  dataset: 'production',
  useCdn: false,
});
const restored = source.withConfig({ dataset: target });
const query = '*[_type in ["siteSettings","category","newModel","usedMachine","article"]]';
const [originalDocs, recoveredDocs, original, recovered] = await Promise.all([
  source.fetch<any[]>(query, {}, { perspective: 'raw' }),
  restored.fetch<any[]>(query, {}, { perspective: 'raw' }),
  source.fetch<Content>(sanityContentQuery, {}, { perspective: 'published' }),
  restored.fetch<Content>(sanityContentQuery, {}, { perspective: 'published' }),
]);
const normalize = (value: any): any => {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !['_rev', '_createdAt', '_updatedAt'].includes(key))
        .map(([key, item]) => [key, normalize(item)]),
    );
  return typeof value === 'string' && value.startsWith('https://cdn.sanity.io/')
    ? value.replace(`/production/`, '/DATASET/').replace(`/${target}/`, '/DATASET/')
    : value;
};
originalDocs.sort((a, b) => a._id.localeCompare(b._id));
recoveredDocs.sort((a, b) => a._id.localeCompare(b._id));
assert.deepEqual(
  normalize(recoveredDocs),
  normalize(originalDocs),
  'Recovered documents differ from production',
);
validateContent(recovered, false);
for (const content of [original, recovered])
  for (const key of ['categories', 'machines', 'articles', 'brands'] as const)
    content[key].sort((a, b) => a.id.localeCompare(b.id));
assert.deepEqual(normalize(recovered), normalize(original), 'Recovered public projection differs');
const report = {
  checkedAt: new Date().toISOString(),
  source: 'production',
  target,
  documents: recoveredDocs.length,
  privateDrafts: recoveredDocs.filter((doc) => doc._id.startsWith('drafts.')).length,
  products: recovered.machines.length,
  categories: recovered.categories.length,
  publishedArticles: recovered.articles.length,
  matched: true,
};
await mkdir('../exports', { recursive: true });
await writeFile('../exports/seo-recovery-check.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
