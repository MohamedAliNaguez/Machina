import { getCliClient } from 'sanity/cli';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { siloCapacityGuide, siloFigures } from '../src/data/silo-capacity';

function keyed(value: any, field = ''): any {
  if (Array.isArray(value))
    return value.map((item, index) =>
      item && typeof item === 'object'
        ? {
            ...keyed(item),
            _key: item._key || `silo-${index}`,
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
  const article = siloCapacityGuide();
  const id = `article-${article.id}`;
  const existing = await client.fetch<any[]>(
    '*[_type == "article" && (id == $id || slug.en == $slug)]',
    { id: article.id, slug: article.slug.en },
    { perspective: 'raw' },
  );
  if (existing.length)
    throw new Error(
      'This guide already exists. Refusing to replace published content; edit it in Studio.',
    );
  const coverProduct = await client.getDocument<any>('product-silos-25-30-50');
  if (!coverProduct?.images?.[0]?.asset?._ref)
    throw new Error('Catalogue silo photograph not found. Nothing published.');
  const category = await client.getDocument<any>('category-silos');
  if (!category) throw new Error('Silos category not found. Nothing published.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/silo-capacity-before-${Date.now()}.json`,
    JSON.stringify({ existing, coverProduct }, null, 2),
  );
  const assets: { _id: string }[] = [];
  for (const figure of siloFigures) {
    const asset = await client.assets.upload(
      'image',
      createReadStream(`../public/images/guides/${figure.file}.webp`),
      { filename: `${figure.file}.webp` },
    );
    assets.push(asset);
  }
  let figureIndex = 0;
  const sections = article.sections.map((section) => ({
    ...section,
    blocks: section.blocks?.map((block) =>
      block.kind === 'figure'
        ? {
            ...block,
            image: {
              _type: 'image',
              alt: block.image!.alt,
              asset: { _type: 'reference', _ref: assets[figureIndex++]._id },
            },
          }
        : block,
    ),
  }));
  const { categoryId, image, imageAlt, relatedGuideIds, ...fields } = article;
  const linkedGuides = await client.fetch<any[]>(
    '*[_type == "article" && id in $ids && !(_id in path("drafts.**"))]{_id,id}',
    { ids: relatedGuideIds },
  );
  if (linkedGuides.length !== relatedGuideIds!.length)
    throw Error('Related published guides not found. Nothing published.');
  const doc = keyed({
    ...fields,
    _id: id,
    _type: 'article',
    sections,
    image: {
      _type: 'image',
      asset: coverProduct.images[0].asset,
      alt: { en: 'Cement storage silos — catalogue photograph', tr: '' },
    },
    relatedGuides: linkedGuides.map((guide) => ({ _type: 'reference', _ref: guide._id })),
    category: { _type: 'reference', _ref: category._id },
    publishedAt: new Date().toISOString(),
  });
  // Atomic create fails if another editor created this ID after the initial check.
  await client.create(doc);
  await writeFile(
    '../.local/sanity/silo-capacity-published.json',
    JSON.stringify(
      { id, assetIds: assets.map((a) => a._id), publishedAt: doc.publishedAt },
      null,
      2,
    ),
  );
  console.log(
    `Published ${id}: English only, ${sections.length} sections, ${figureIndex} original figures. SEO approval pending. Existing guides and private drafts preserved.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
