import sharp from 'sharp';
import fs from 'node:fs/promises';
const root = 'test-results/steel-implementation/';
const pairs = [
  ['01-catalogue', 'catalogue'],
  ['02-category', 'category'],
  ['03-new-model', 'new'],
  ['04-used-machine', 'used'],
  ['05-guides', 'guides'],
  ['06-article', 'article'],
  ['07-about', 'about'],
  ['08-contact', 'contact'],
  ['09-privacy', 'privacy'],
  ['10-not-found', '404'],
];
const results = [];
for (const [ref, name] of pairs) {
  const reference = 'docs/design/steel-site-mockups/' + ref + '.png',
    implementation = root + name + '-desktop.png';
  const a = await sharp(reference).resize(720, 550, { fit: 'fill' }).toBuffer();
  const normalized = await sharp(implementation).resize({ width: 1440 }).toBuffer();
  const meta = await sharp(normalized).metadata();
  const b = await sharp(normalized)
    .extend({ bottom: Math.max(0, 1100 - meta.height), background: '#f5f7f9' })
    .extract({ left: 0, top: 0, width: 1440, height: 1100 })
    .resize(720, 550)
    .toBuffer();
  const comparison = root + name + '-comparison.png';
  await sharp({ create: { width: 1440, height: 550, channels: 3, background: '#eef2f5' } })
    .composite([
      { input: a, left: 0, top: 0 },
      { input: b, left: 720, top: 0 },
    ])
    .png()
    .toFile(comparison);
  const source = await sharp(reference).metadata(),
    capture = await sharp(implementation).metadata();
  results.push({
    name,
    reference,
    implementation,
    comparison,
    source: [source.width, source.height],
    capture: [capture.width, capture.height],
    viewport: [1440, 1100],
  });
}
await fs.writeFile(root + 'comparisons.json', JSON.stringify(results, null, 2));
for (let group = 0; group < 4; group++) {
  const selected = results.slice(group * 3, group * 3 + 3),
    overlays = [];
  for (let i = 0; i < selected.length; i++)
    overlays.push({ input: await fs.readFile(selected[i].comparison), left: 0, top: i * 550 });
  await sharp({
    create: { width: 1440, height: 550 * selected.length, channels: 3, background: '#eef2f5' },
  })
    .composite(overlays)
    .png()
    .toFile(root + 'comparison-board-' + (group + 1) + '.png');
}
console.log('Prepared ' + results.length + ' reference / implementation comparisons');

const mobilePairs = [
  ['11-mobile-catalogue', 'catalogue'],
  ['12-mobile-used-machine', 'used'],
  ['13-mobile-contact-tr', 'contact-tr'],
];
for (const [reference, name] of mobilePairs) {
  const a = await sharp('docs/design/steel-site-mockups/' + reference + '.png')
    .resize(390, 1000, { fit: 'fill' })
    .toBuffer();
  const file = root + name + '-mobile.png';
  const normalized = await sharp(file).resize({ width: 390 }).toBuffer();
  const meta = await sharp(normalized).metadata();
  const b = await sharp(normalized)
    .extend({ bottom: Math.max(0, 1000 - meta.height), background: '#f5f7f9' })
    .extract({ left: 0, top: 0, width: 390, height: 1000 })
    .toBuffer();
  await sharp({ create: { width: 780, height: 1000, channels: 3, background: '#f5f7f9' } })
    .composite([
      { input: a, left: 0, top: 0 },
      { input: b, left: 390, top: 0 },
    ])
    .png()
    .toFile(root + name + '-mobile-comparison.png');
}
console.log('Prepared three mobile reference / implementation comparisons');
