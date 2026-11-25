import { getCliClient } from 'sanity/cli';
import { mkdir, writeFile } from 'node:fs/promises';
import { initialGuideDrafts } from '../src/data/seo-editorial';
function keyed(value: any, field = ''): any {
  if (Array.isArray(value))
    return value.map((item, index) =>
      item && typeof item === 'object'
        ? {
            ...keyed(item),
            _type:
              item._type ||
              (item.kind
                ? 'guideBlock'
                : item.en !== undefined
                  ? field === 'cells'
                    ? 'localeText'
                    : 'localeString'
                  : 'object'),
            _key: item._key || `guide-${index}`,
          }
        : item,
    );
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, keyed(v, k)]));
  return value;
}
async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const ids = initialGuideDrafts.map((g) => `drafts.article-${g.id}`);
  const docs = await client.fetch<any[]>('*[_id in $ids]', { ids }, { perspective: 'raw' });
  const products = await client.fetch<any[]>(
    '*[_type == "newModel" && !(_id in path("drafts.**"))]{_id,id}',
  );
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/guides-before-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  let tx = client.transaction();
  let count = 0;
  for (const guide of initialGuideDrafts) {
    const doc = docs.find((d) => d._id === `drafts.article-${guide.id}`);
    if (!doc || !doc.sample || doc.author || doc.reviewer) {
      console.log(`Preserved editorially reviewed or missing draft ${guide.id}`);
      continue;
    }
    const { title, excerpt, sections, seoTitle, seoDescription } = guide;
    const relatedProducts = (guide.relatedProductIds || []).flatMap((id) =>
      products.filter((p) => p.id === id).map((p) => ({ _type: 'reference', _ref: p._id })),
    );
    tx = tx.patch(doc._id, (p) =>
      p
        .ifRevisionId(doc._rev)
        .set(keyed({ title, excerpt, sections, seoTitle, seoDescription, relatedProducts })),
    );
    count++;
  }
  if (count) await tx.commit();
  console.log(
    `Reworked ${count} private guide drafts; no documents published and no approvals or authors invented.`,
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
