// Trace the supplied artwork into scalable paths; do not substitute a lookalike font.
// Run with: node scripts/prepare-brand.mjs path/to/logo.jpg
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const source = process.argv[2];
if (!source) throw new Error('Provide the approved TECHNICSAN logo image.');
const { data, info } = await sharp(source)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const width = info.width;
const height = info.height;

function simplify(points, tolerance = 0.55) {
  if (points.length < 3) return points;
  const a = points[0],
    b = points.at(-1);
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  let max = 0,
    split = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const t =
      dx || dy
        ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
        : 0;
    const distance = Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
    if (distance > max) {
      max = distance;
      split = i;
    }
  }
  return max > tolerance
    ? [
        ...simplify(points.slice(0, split + 1), tolerance).slice(0, -1),
        ...simplify(points.slice(split), tolerance),
      ]
    : [a, b];
}

function trace(predicate) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++)
    mask[i] = predicate(...data.subarray(i * 3, i * 3 + 3), i % width, Math.floor(i / width))
      ? 1
      : 0;
  const edges = new Map();
  const point = (x, y) => y * (width + 1) + x;
  const add = (a, b) => edges.set(a, [...(edges.get(a) || []), b]);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      if (!y || !mask[(y - 1) * width + x]) add(point(x, y), point(x + 1, y));
      if (x === width - 1 || !mask[y * width + x + 1]) add(point(x + 1, y), point(x + 1, y + 1));
      if (y === height - 1 || !mask[(y + 1) * width + x]) add(point(x + 1, y + 1), point(x, y + 1));
      if (!x || !mask[y * width + x - 1]) add(point(x, y + 1), point(x, y));
    }
  const paths = [];
  const xy = (key) => [key % (width + 1), Math.floor(key / (width + 1))];
  while (edges.size) {
    const start = edges.keys().next().value;
    let current = start;
    const loop = [];
    do {
      loop.push(xy(current));
      const list = edges.get(current);
      if (!list?.length) break;
      const next = list.pop();
      if (!list.length) edges.delete(current);
      current = next;
    } while (current !== start);
    if (loop.length < 8) continue;
    let area = 0;
    for (let i = 0; i < loop.length; i++) {
      const a = loop[i],
        b = loop[(i + 1) % loop.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    if (Math.abs(area) < 12) continue;
    const mid = Math.floor(loop.length / 2);
    const clean = [
      ...simplify(loop.slice(0, mid + 1)),
      ...simplify([...loop.slice(mid), loop[0]]).slice(1, -1),
    ];
    paths.push('M' + clean.map((p) => p.join(' ')).join('L') + 'Z');
  }
  return paths.join('');
}

// Exclude the retired signature while retaining the lower part of the three-bar emblem.
const green = trace(
  (r, g, b, x, y) => (x < 410 || y < 310) && g > r * 1.1 && g > b * 1.08 && g < 145 && r < 100,
);
const lime = trace(
  (r, g, b, x, y) => (x < 410 || y < 310) && r > 70 && g > 140 && g > r * 1.1 && b < 100,
);
const brand = JSON.parse(await readFile('src/data/brand.json', 'utf8'));
const slogan = await readFile('public/brand/technicsan-slogan.svg', 'utf8');
const sloganPath = slogan.match(/ d="([^"]+)"/)?.[1];
if (!sloganPath || !slogan.includes(`aria-label="${brand.slogan}"`))
  throw new Error('Regenerate the approved slogan outline first.');
const svg = (box, ink, accent = '#9bc900', full = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill-rule="evenodd" role="img" aria-label="TECHNICSAN${full ? ' — ' + brand.slogan : ''}"><path fill="${ink}" d="${green}"/><path fill="${accent}" d="${lime}"/>${full ? `<g transform="translate(535 321)" fill-rule="nonzero"><path fill="${ink}" d="${sloganPath}"/></g><path fill="${accent}" d="M423 337H512V344H423ZM1359 337H1448V344H1359Z"/>` : ''}</svg>\n`;
await mkdir('public/brand', { recursive: true });
await Promise.all([
  writeFile('public/brand/technicsan.svg', svg('85 140 1382 231', '#003b27')),
  writeFile('public/brand/technicsan-light.svg', svg('85 140 1382 231', '#f2f5f0')),
  writeFile(
    'public/brand/technicsan-wordmark-light.svg',
    svg('411 175 1056 130', '#dce3de', '#9bc900', false),
  ),
]);
const logo = await readFile('public/brand/technicsan.svg');
const logoImage = await sharp(logo).resize({ width: 1050 }).png().toBuffer();
const socialBase = Buffer.from(
  '<svg width="1200" height="630"><rect width="1200" height="630" fill="#f5f7f3"/><path d="M0 0H1200V14H0Z" fill="#003b27"/><path d="M0 616H1200V630H0Z" fill="#9bc900"/></svg>',
);
await sharp(socialBase)
  .composite([{ input: logoImage, left: 75, top: 225 }])
  .png()
  .toFile('public/brand/technicsan-social.png');
console.log('Prepared three scalable logo variants from the supplied TECHNICSAN artwork.');
