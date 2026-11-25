import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';

async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const products = JSON.parse(await readFile('../src/data/catalogue-products.json', 'utf8')).filter(
    (product: any) => product.categoryId === 'lpg-catalog',
  );
  const ids = products.flatMap((product: any) => [
    'product-' + product.id,
    'drafts.product-' + product.id,
  ]);
  const docs = await client.fetch<any[]>('*[_id in $ids]', { ids }, { perspective: 'raw' });
  if (products.some((product: any) => !docs.some((doc) => doc._id === 'product-' + product.id)))
    throw new Error('An LPG product is missing; catalogue update stopped.');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/lpg-alignment-before-${Date.now()}.json`,
    JSON.stringify(docs, null, 2),
  );
  let transaction = client.transaction();
  for (const doc of docs) {
    const product = products.find((product: any) => product.id === doc.id);
    const changes: Record<string, unknown> = { catalogueOrder: product.catalogueOrder };
    if (product.id === 'lpg-vaporiser') {
      changes.specs = product.specs.map((spec: any, index: number) => ({
        ...spec,
        _type: 'spec',
        _key: 'lpg-spec-' + index,
      }));
      changes.description = product.description;
    }
    transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set(changes));
  }
  await transaction.commit();
  console.log(
    'Aligned seven LPG product positions and the qualified vaporiser reference entry; photos and approvals preserved.',
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
