import { getCliClient } from 'sanity/cli';
import { mkdir, writeFile } from 'node:fs/promises';
async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const existing = await client.getDocument('websiteAvailability');
  await mkdir('../.local/sanity', { recursive: true });
  await writeFile(
    `../.local/sanity/availability-before-${Date.now()}.json`,
    JSON.stringify(existing || null, null, 2),
  );
  const value = await client.createIfNotExists({
    _id: 'websiteAvailability',
    _type: 'websiteAvailability',
    status: 'online',
  });
  console.log(
    `Website control ready. Saved status: ${value.status}. Existing status was preserved.`,
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
