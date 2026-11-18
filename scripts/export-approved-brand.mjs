// Derive website assets from the approved editable vector master.
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
if (process.argv.length > 2)
  throw new Error('Edit docs/brand/technicsan-master.svg; raster tracing is retired.');
const master = await readFile('docs/brand/technicsan-master.svg', 'utf8');
const brand = JSON.parse(await readFile('src/data/brand.json', 'utf8'));
if (!master.includes(brand.slogan))
  throw new Error('Master slogan does not match the approved signature.');
const emblem = master.match(
  /<g inkscape:groupmode="layer" inkscape:label="Emblem" id="emblem">([\s\S]*?)<\/g>/,
)?.[1];
const wordmark = master.match(/<g id="wordmark"[\s\S]*?<\/g>/)?.[0];
if (!emblem || !wordmark) throw new Error('Master is missing the emblem or wordmark group.');
const wrap = (viewBox, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="${viewBox}" role="img" aria-label="TECHNICSAN">${body}</svg>\n`;
const full = master.replace(
  'viewBox="55 115 1444 282" width="1444" height="282"',
  'viewBox="85 140 1382 231"',
);
const light = (svg) => svg.replaceAll('#003b27', '#f2f5f0');
const wordmarkLight = light(wrap('411 175 1056 130', wordmark));
await mkdir('public/brand', { recursive: true });
await Promise.all([
  writeFile('public/brand/technicsan.svg', full),
  writeFile('public/brand/technicsan-light.svg', light(full)),
  writeFile(
    'public/brand/technicsan-compact.svg',
    wrap('85 140 1382 231', `<g fill="#003b27">${emblem}${wordmark}</g>`),
  ),
  writeFile('public/brand/technicsan-wordmark-light.svg', wordmarkLight),
  writeFile('public/brand/technicsan-wordmark-sharp.svg', wordmarkLight),
  writeFile('public/brand/technicsan-symbol.svg', wrap('63 115 387 282', emblem)),
  writeFile(
    'public/favicon.svg',
    wrap(
      '63 63 387 387',
      `<rect x="63" y="63" width="387" height="387" rx="34" fill="#fff"/>${emblem}`,
    ),
  ),
]);
const paths = [...emblem.matchAll(/<path[^>]*fill="([^"]+)"[^>]*d="([^"]+)"/g)].map((match) => ({
  fill: match[1],
  d: match[2],
}));
if (paths.length !== 3) throw new Error('Expected three emblem bars.');
await writeFile('src/data/brand-symbol.json', JSON.stringify(paths, null, 2) + '\n');
const logoImage = await sharp(Buffer.from(full)).resize({ width: 1050 }).png().toBuffer();
const socialBase = Buffer.from(
  '<svg width="1200" height="630"><rect width="1200" height="630" fill="#f5f7f3"/><path d="M0 0H1200V14H0Z" fill="#003b27"/><path d="M0 616H1200V630H0Z" fill="#9bc900"/></svg>',
);
await sharp(socialBase)
  .composite([{ input: logoImage, left: 75, top: 225 }])
  .png()
  .toFile('public/brand/technicsan-social.png');
console.log('Website identity assets regenerated from the approved vector master.');
