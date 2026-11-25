import { getCliClient } from 'sanity/cli';
import { mkdir, writeFile } from 'node:fs/promises';
import { cementProcurementGuide } from '../src/data/cement-procurement';
import type { Article } from '../src/lib/types';
function keyed(value: any, field = ''): any {
  if (Array.isArray(value))
    return value.map((item, i) =>
      item && typeof item === 'object'
        ? {
            ...keyed(item),
            _key: `procurement-${i}`,
            _type:
              item._type ||
              (item.kind
                ? 'guideBlock'
                : item.en !== undefined
                  ? field === 'cells'
                    ? 'localeText'
                    : 'localeString'
                  : 'object'),
          }
        : item,
    );
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, keyed(v, k)]));
  return value;
}
async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const ids = ['article-guide-cement-bulker-enquiry', 'drafts.article-guide-cement-bulker-enquiry'];
  const docs = await client.fetch<any[]>('*[_id in $ids]', { ids }, { perspective: 'raw' });
  if (!docs.some((d) => d._id === ids[0]))
    throw new Error('Published cement guide not found; no changes made.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/cement-procurement-before-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  let tx = client.transaction();
  for (const doc of docs) {
    if (doc.id !== 'guide-cement-bulker-enquiry' || doc.category?._ref !== 'category-cement-bulker')
      throw new Error('Unexpected guide identity/category; no changes made.');
    const updated = cementProcurementGuide(doc as Article);
    const { title, excerpt, seoTitle, seoDescription, sections, sources } = updated;
    tx = tx.patch(doc._id, (p) =>
      p.ifRevisionId(doc._rev).set(
        keyed({
          title,
          excerpt,
          seoTitle,
          seoDescription,
          sections,
          sources,
          seoApproval: { en: 'pending', tr: 'pending' },
        }),
      ),
    );
  }
  await tx.commit();
  console.log(
    `Updated ${docs.length} cement guide documents. Images, authorship, language publication, sample flag and URLs preserved. SEO approvals remain pending. Backup saved privately.`,
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
