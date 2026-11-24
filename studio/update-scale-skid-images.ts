import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';
import products from '../src/data/catalogue-products.json';

async function main() {
  const product = products.find((p) => p.id === 'lpg-scale-skid-system')!;
  if (product.images.length !== 3) throw new Error('Expected the three supplied views.');
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const docs = await client.fetch<any[]>(
    '*[_id in ["product-lpg-scale-skid-system", "drafts.product-lpg-scale-skid-system"]]',
    {},
    { perspective: 'raw' },
  );
  if (!docs.length) throw new Error('Scale skid product not found.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/scale-skid-images-before-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  const images: Record<string, unknown>[] = [];
  for (const [index, image] of product.images.entries()) {
    const asset = await client.assets.upload('image', await readFile(`../public${image.src}`), {
      filename: image.src.split('/').pop(),
      extract: [],
    });
    const { src, ...metadata } = image;
    images.push({
      ...metadata,
      _type: 'machineImage',
      _key: `technicsan-view-${index + 1}`,
      asset: { _type: 'reference', _ref: asset._id },
    });
  }
  let transaction = client.transaction();
  for (const doc of docs)
    transaction = transaction.patch(doc._id, (patch) =>
      patch.ifRevisionId(doc._rev).set({ images }),
    );
  await transaction.commit();
  console.log(
    'Replaced scale skid gallery with three supplied views; remaining content preserved.',
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
