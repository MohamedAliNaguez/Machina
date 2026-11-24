import type { Content } from '../../src/lib/types';

// Published public documents must use root IDs; dotted namespaces need authenticated reads.
export const categoryDocumentId = (id: string) => `category-${id}`;
export const productDocumentId = (id: string) => `product-${id}`;
export const articleDocumentId = (id: string) => `article-${id}`;

// Sanity object-array members need stable keys, including nested specification rows.
function keyed(value: any): any {
  if (Array.isArray(value))
    return value.map((item, index) =>
      item && typeof item === 'object' && !Array.isArray(item)
        ? { ...keyed(item), _key: item._key || `item-${index}` }
        : keyed(item),
    );
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, keyed(item)]));
  return value;
}

export async function prepareSanitySeed(
  content: Content,
  upload: (src: string, type: 'image' | 'file') => Promise<string>,
  existing = new Set<string>(),
) {
  const documents: Record<string, any>[] = [];
  const absent = (id: string) => !existing.has(id) && !existing.has(`drafts.${id}`);
  const ref = (id: string) => ({ _type: 'reference', _ref: id });
  const image = async (value: Content['machines'][number]['images'][number]) => {
    const { src, sourceUrl: _privateSource, credit: _privateCredit, ...fields } = value;
    return { ...fields, _type: 'machineImage', asset: ref(await upload(src, 'image')) };
  };
  if (absent('siteSettings')) {
    const { heroImage, ...settings } = content.settings;
    documents.push({
      _id: 'siteSettings',
      _type: 'siteSettings',
      ...settings,
      ...(heroImage ? { heroImage: await image(heroImage) } : {}),
    });
  }
  for (const category of content.categories) {
    const _id = categoryDocumentId(category.id);
    if (absent(_id)) documents.push({ _id, _type: 'category', ...category });
  }
  for (const product of content.machines) {
    const _id = productDocumentId(product.id);
    if (!absent(_id)) continue;
    // Only transfer the active neutral catalogue; private source archives stay local.
    const {
      categoryId,
      brandId: _brand,
      kind,
      images,
      brochure,
      reference: _privateReference,
      ...fields
    } = product;
    documents.push({
      _id,
      _type: kind === 'new' ? 'newModel' : 'usedMachine',
      ...fields,
      category: ref(categoryDocumentId(categoryId)),
      images: await Promise.all(images.map(image)),
      ...(brochure
        ? {
            brochure: {
              _type: 'file',
              label: brochure.label,
              asset: ref(await upload(brochure.url, 'file')),
            },
          }
        : {}),
    });
  }
  for (const article of content.articles) {
    const _id = articleDocumentId(article.id);
    if (!absent(_id)) continue;
    const { categoryId, image: src, ...fields } = article;
    documents.push({
      _id,
      _type: 'article',
      ...fields,
      category: ref(categoryDocumentId(categoryId)),
      image: { _type: 'image', asset: ref(await upload(src, 'image')) },
    });
  }
  return documents.map(keyed);
}
