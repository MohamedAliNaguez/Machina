import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';

async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const docs = await client.fetch<any[]>(
    '*[_id in ["product-lpg-semi-trailer", "drafts.product-lpg-semi-trailer"]]',
    {},
    { perspective: 'raw' },
  );
  if (!docs.some((doc) => doc._id === 'product-lpg-semi-trailer'))
    throw new Error('Semi-trailer product not found.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/semi-trailer-image-before-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  const asset = await client.assets.upload(
    'image',
    await readFile('../public/images/products/lpg/lpg-semi-trailer-technicsan.webp'),
    { filename: 'lpg-semi-trailer-technicsan.webp', extract: [] },
  );
  const alt = {
    tr: 'LPG yarı römork — TECHNICSAN logolu arka görünüm',
    en: 'LPG semi-trailer — rear view with TECHNICSAN logo',
  };
  let transaction = client.transaction();
  for (const doc of docs) {
    const images = [...doc.images];
    images[0] = {
      ...images[0],
      _type: 'machineImage',
      asset: { _type: 'reference', _ref: asset._id },
      alt,
      placeholder: false,
      illustrative: true,
      rightsStatus: 'pending',
    };
    transaction = transaction.patch(doc._id, (patch) =>
      patch.ifRevisionId(doc._rev).set({ images }),
    );
  }
  await transaction.commit();
  console.log(
    `Updated semi-trailer main image in ${docs.length} document(s); remaining gallery and content preserved.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
