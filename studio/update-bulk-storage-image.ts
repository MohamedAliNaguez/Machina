import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';

async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const docs = await client.fetch<any[]>(
    '*[_id in ["product-lpg-bulk-storage-tank", "drafts.product-lpg-bulk-storage-tank"]]',
    {},
    { perspective: 'raw' },
  );
  if (!docs.some((doc) => doc._id === 'product-lpg-bulk-storage-tank'))
    throw new Error('Bulk storage product not found.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/bulk-storage-image-before-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  const replacements = [
    {
      filename: 'lpg-bulk-storage-tank-workshop.webp',
      alt: {
        en: 'TECHNICSAN LPG bulk storage tank — full side view inside the workshop',
        tr: 'TECHNICSAN LPG dökme depolama tankı — atölyede tam yan görünüm',
      },
    },
    {
      filename: 'lpg-bulk-storage-tank-transport.webp',
      alt: {
        en: 'LPG bulk storage tank secured on a flatbed trailer inside the workshop',
        tr: 'Atölyede açık kasa treylere sabitlenmiş LPG dökme depolama tankı',
      },
    },
  ];
  const images = await Promise.all(
    replacements.map(async ({ filename, alt }, index) => {
      const asset = await client.assets.upload(
        'image',
        await readFile('../public/images/products/lpg/' + filename),
        { filename, extract: [] },
      );
      return {
        _key: 'bulk-storage-' + index,
        _type: 'machineImage',
        asset: { _type: 'reference', _ref: asset._id },
        alt,
        placeholder: false,
        illustrative: true,
        rightsStatus: 'pending',
      };
    }),
  );
  let transaction = client.transaction();
  for (const doc of docs) {
    transaction = transaction.patch(doc._id, (patch) =>
      patch.ifRevisionId(doc._rev).set({ images }),
    );
  }
  await transaction.commit();
  console.log(
    `Replaced bulk storage gallery with two supplied photos in ${docs.length} document(s); product facts and search approvals preserved.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
