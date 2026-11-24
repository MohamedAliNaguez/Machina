import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';

async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const docs = await client.fetch<any[]>(
    '*[_id in ["product-lpg-bobtail", "drafts.product-lpg-bobtail"]]',
    {},
    { perspective: 'raw' },
  );
  if (!docs.some((doc) => doc._id === 'product-lpg-bobtail'))
    throw new Error('Bobtail product not found.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/bobtail-image-before-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  const asset = await client.assets.upload(
    'image',
    await readFile('../public/images/products/lpg/lpg-bobtail-technicsan.webp'),
    { filename: 'lpg-bobtail-technicsan.webp', extract: [] },
  );
  const alt = {
    tr: 'LPG tanker gövdesi — TECHNICSAN logolu yan görünüm',
    en: 'LPG bobtail tank body — side view with TECHNICSAN logo',
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
    `Updated bobtail main image in ${docs.length} document(s); remaining gallery and content preserved.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
