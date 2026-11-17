import { readFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Source URLs and original artwork belong to the private archive, never the public asset directory.
const report = JSON.parse(
  await readFile('.local/catalogue-provenance/reference-import.json', 'utf8'),
);
const missing = [];
let written = 0;
for (const asset of report.media) {
  const input = path.join('.local/source-import', asset.file);
  const output = path.join('.local/catalogue-provenance/images', path.basename(asset.output));
  try {
    await access(input);
  } catch {
    missing.push(asset.file);
    continue;
  }
  await mkdir(path.dirname(output), { recursive: true });
  try {
    await sharp(input)
      .rotate()
      .resize({ width: 1200, height: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 83 })
      .toFile(output);
  } catch (error) {
    missing.push({ file: asset.file, reason: error.message });
    continue;
  }
  written++;
}
console.log(JSON.stringify({ written, missing }));
if (missing.length) process.exitCode = 1;
