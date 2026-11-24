import { readFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, basename } from 'node:path';
import { getCliClient } from 'sanity/cli';
import { repositoryContent } from '../src/data/repository';
import { prepareSanitySeed } from '../scripts/lib/sanity-seed';

async function main() {
  const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false });
  const publicRoot = resolve(process.cwd(), '../public');
  const existing = new Set(
    await client.fetch<string[]>(
      '*[_type in ["siteSettings", "category", "newModel", "usedMachine", "article"]]._id',
      {},
      { perspective: 'raw' },
    ),
  );
  const uploads = new Map<string, Promise<string>>();
  const upload = (src: string, type: 'image' | 'file') => {
    if (!uploads.has(src))
      uploads.set(
        src,
        (async () => {
          if (!src.startsWith('/images/'))
            throw new Error('Seed accepts only reviewed local image assets.');
          const target = resolve(publicRoot, src.slice(1));
          const path = relative(publicRoot, target);
          if (path.startsWith('..') || isAbsolute(path))
            throw new Error('Asset is outside public/.');
          const asset = await client.assets.upload(type, await readFile(target), {
            filename: basename(target),
            extract: [],
          });
          return asset._id;
        })(),
      );
    return uploads.get(src)!;
  };
  const docs = await prepareSanitySeed(repositoryContent, upload, existing);
  if (!docs.length) {
    console.log('Nothing to import. Existing content and drafts were preserved.');
    return;
  }
  let transaction = client.transaction();
  for (const document of docs) transaction = transaction.createIfNotExists(document as any);
  await transaction.commit();
  console.log(
    `Imported ${docs.length} missing documents. Existing content, drafts and review flags were preserved.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
