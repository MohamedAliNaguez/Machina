import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface SourceReview {
  url: string;
  label: string;
  section?: string;
}
let reviews: Promise<Map<string, SourceReview>> | undefined;

/** Local editorial aid only. Private provenance is never included in a public build. */
export async function getSourceReview(productId: string): Promise<SourceReview | undefined> {
  if (!import.meta.env.DEV) return undefined;
  reviews ??= loadReviews();
  return (await reviews).get(productId);
}

async function loadReviews() {
  const directory = join(process.cwd(), '.local', 'catalogue-provenance');
  const [mapping, originals] = await Promise.all([
    readFile(join(directory, 'presentation-map.json'), 'utf8'),
    readFile(join(directory, 'reference-products.json'), 'utf8'),
  ]).catch(() => ['', '']);
  if (!mapping || !originals) return new Map<string, SourceReview>();
  const products = JSON.parse(originals) as {
    id: string;
    model: string;
    reference: { url: string; originalLabel?: string; section?: string };
  }[];
  const byId = new Map(products.map((product) => [product.id, product]));
  const result = new Map<string, SourceReview>();
  for (const entry of JSON.parse(mapping) as { publicId: string; originalId: string }[]) {
    const product = byId.get(entry.originalId);
    if (!product?.reference?.url) continue;
    const url = new URL(product.reference.url);
    if (url.protocol !== 'https:') continue;
    result.set(entry.publicId, {
      url: url.href,
      label: product.reference.originalLabel || product.model,
      section: product.reference.section,
    });
  }
  return result;
}
