import { mkdir, writeFile } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';

async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const docs = await client.fetch<any[]>(
    '*[_id in ["product-lpg-dispenser-skid-system", "drafts.product-lpg-dispenser-skid-system"]]{..., "imageFilenames": images[].asset->originalFilename}',
    {},
    { perspective: 'raw' },
  );
  if (!docs.length) throw new Error('Dispenser product not found.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/dispenser-before-dedupe-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  let transaction = client.transaction(),
    changed = 0;
  for (const doc of docs) {
    const images = doc.images.filter(
      (_: unknown, index: number) =>
        doc.imageFilenames[index] !== 'lpg-dispenser-skid-system-2.webp',
    );
    if (!images.length) throw new Error('Cannot remove the entire gallery.');
    if (images.length === doc.images.length) continue;
    transaction = transaction.patch(doc._id, (patch) =>
      patch.ifRevisionId(doc._rev).set({ images }),
    );
    changed++;
  }
  if (changed) await transaction.commit();
  console.log(`Removed duplicate photograph from ${changed} document(s).`);
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
