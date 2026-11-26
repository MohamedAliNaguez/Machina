import { getCliClient } from 'sanity/cli';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { cementUnloadingGuide, unloadingFigures } from '../src/data/cement-unloading';

function keyed(value: any, field = ''): any {
  if (Array.isArray(value))
    return value.map((item, index) =>
      item && typeof item === 'object'
        ? {
            ...keyed(item),
            _key: item._key || `unloading-${index}`,
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
  const article = cementUnloadingGuide();
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
  const oldGuide = await client.getDocument<any>('article-guide-cement-bulker-enquiry');
  if (!oldGuide?.image?.asset?._ref)
    throw new Error('Existing guide cover not found. Nothing published.');
  const category = await client.getDocument<any>('category-cement-bulker');
  if (!category) throw new Error('Cement bulker category not found. Nothing published.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/unloading-before-${Date.now()}.json`,
    JSON.stringify({ existing, oldGuide }, null, 2),
  );
  const assets: { _id: string }[] = [];
  for (const figure of unloadingFigures) {
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
  const { categoryId, image, imageAlt, ...fields } = article;
  const doc = keyed({
    ...fields,
    _id: id,
    _type: 'article',
    sections,
    image: { ...oldGuide.image, alt: oldGuide.image.alt },
    category: { _type: 'reference', _ref: category._id },
    publishedAt: new Date().toISOString(),
  });
  // Atomic create fails if another editor created this ID after the initial check.
  await client.create(doc);
  await writeFile(
    '../.local/sanity/unloading-published.json',
    JSON.stringify(
      { id, assetIds: assets.map((a) => a._id), publishedAt: doc.publishedAt },
      null,
      2,
    ),
  );
  console.log(
    `Published ${id}: English only, ${sections.length} sections, ${figureIndex} original figures. SEO approval pending. Existing guide preserved.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
