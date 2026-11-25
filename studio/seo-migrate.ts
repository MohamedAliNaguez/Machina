import { mkdir, writeFile } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';
import {
  categoryEditorialDrafts,
  homeSeoDraft,
  initialGuideDrafts,
} from '../src/data/seo-editorial';

function keyed(value: any): any {
  if (Array.isArray(value))
    return value.map((item, index) =>
      item && typeof item === 'object'
        ? { ...keyed(item), _key: item._key || `seo-${index}` }
        : item,
    );
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, keyed(item)]));
  return value;
}
async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const docs = await client.fetch<Record<string, any>[]>(
    '*[_type in ["siteSettings","category","newModel","usedMachine","article"]]',
    {},
    { perspective: 'raw' },
  );
  const folder = '../.local/sanity';
  await mkdir(folder, { recursive: true });
  await writeFile(
    `${folder}/before-seo-${new Date().toISOString().replaceAll(':', '-')}.json`,
    JSON.stringify(docs, null, 2),
  );
  let tx = client.transaction();
  for (const doc of docs) {
    let additions: Record<string, any> = { seoApproval: { en: 'pending', tr: 'pending' } };
    if (doc._type === 'siteSettings') {
      additions = {
        manufacturerVerified: false,
        historyApproved: false,
        pageSeo: {
          home: homeSeoDraft,
          about: {
            seoTitle: { en: 'About TECHNICSAN', tr: 'TECHNICSAN hakkında' },
            seoDescription: {
              en: 'Discover the company behind TECHNICSAN and its five industrial equipment families.',
              tr: 'TECHNICSAN şirketini ve beş endüstriyel ekipman grubunu tanıyın.',
            },
            seoApproval: { en: 'pending', tr: 'pending' },
          },
          contact: {
            seoTitle: {
              en: 'Contact Sales for Industrial Equipment',
              tr: 'Endüstriyel Ekipman için Satış İletişimi',
            },
            seoDescription: {
              en: 'Contact TECHNICSAN in Ankara, Turkey about cement bulkers, LPG equipment, compressors, mixers and silos. Request a project-specific quotation.',
              tr: 'Çimento silobası, LPG ekipmanları, kompresörler, mikserler ve silolar için Ankara’daki TECHNICSAN ile iletişime geçin. Projeye özel teklif isteyin.',
            },
            seoApproval: { en: 'pending', tr: 'pending' },
          },
        },
      };
    } else if (doc._type === 'category') {
      const editorial = categoryEditorialDrafts[doc.id];
      if (!editorial) throw new Error(`Unrecognised category ${doc.id}`);
      additions = {
        ...additions,
        published: ['en', 'tr'],
        editorial,
        seoTitle: editorial.heading,
        seoDescription: doc.description,
      };
    } else {
      additions = {
        ...additions,
        seoTitle: doc.name || doc.title,
        seoDescription: doc.summary || doc.excerpt,
      };
      if (doc._type === 'article') {
        const photo = docs
          .flatMap((d) => d.images || [])
          .find((image) => image.asset?._ref === doc.image?.asset?._ref);
        if (photo?.alt) additions['image.alt'] = photo.alt;
      }
    }
    // Fill missing fields only. Existing copy, approvals and unpublished editor changes survive.
    tx = tx.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).setIfMissing(keyed(additions)));
  }
  let created = 0;
  for (const guide of initialGuideDrafts) {
    const id = `article-${guide.id}`;
    if (docs.some((doc) => doc._id === id || doc._id === `drafts.${id}`)) continue;
    const product = docs.find(
      (doc) =>
        !doc._id.startsWith('drafts.') &&
        doc.category?._ref === `category-${guide.categoryId}` &&
        doc.images?.[0]?.asset,
    );
    if (!product) throw new Error(`A reference image is needed for draft ${guide.id}`);
    const { categoryId, image: _image, ...fields } = guide;
    tx = tx.createIfNotExists(
      keyed({
        _id: `drafts.${id}`,
        _type: 'article',
        ...fields,
        category: { _type: 'reference', _ref: `category-${categoryId}` },
        image: { _type: 'image', asset: product.images[0].asset, alt: product.images[0].alt },
      }),
    );
    created++;
  }
  await tx.commit();
  console.log(
    `SEO defaults added without overwriting existing fields; ${created} private guide drafts prepared. No search approvals or publication dates were granted.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
