import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const source = process.argv[2];
if (!source) throw new Error('Provide the approved Lime Signature PNG as the first argument.');
await mkdir('public/images/brand', { recursive: true });
const metadata = await sharp(source).metadata();
if (metadata.width !== 1774 || metadata.height !== 887) {
  throw new Error('Use the approved 1774 × 887 artwork; its composition defines the CSS frame.');
}
for (const width of [800, 1400, 1774]) {
  const output = `public/images/brand/pressure-lime-${width}.webp`;
  const result = await sharp(source)
    .resize({ width })
    .webp({ quality: 90, effort: 6 })
    .toFile(output);
  console.log(`${output}: ${result.size} bytes`);
}
