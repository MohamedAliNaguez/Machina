import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(root, '../../..');
const screens = JSON.parse(await fs.readFile(path.join(root, 'screens.json'), 'utf8'));
await fs.mkdir(path.join(root, 'assets'), { recursive: true });
await fs.copyFile(
  path.join(project, 'test-results/title-correction/desktop-en.jpg'),
  path.join(root, '00-approved-homepage.jpg'),
);
for (const [source, target] of [
  ['node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2', 'anton.woff2'],
  [
    'node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2',
    'body.woff2',
  ],
  ['public/images/theatre/title-metal.webp', 'steel.webp'],
  ['public/licenses/anton.txt', 'anton-license.txt'],
  ['public/licenses/source-sans-3.txt', 'source-sans-license.txt'],
])
  await fs.copyFile(path.join(project, source), path.join(root, 'assets', target));

for (const screen of screens) {
  const metadata = await sharp(path.join(root, screen.file)).metadata();
  screen.width = metadata.width;
  screen.height = metadata.height;
  await sharp(path.join(root, screen.file))
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(root, screen.preview));
  await sharp(path.join(root, screen.file))
    .resize({ width: 620, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(root, 'assets', screen.id + '-thumb.jpg'));
}
await fs.writeFile(
  path.join(root, 'manifest.json'),
  JSON.stringify(
    {
      created: '2026-10-20',
      revision: 'footer-cleanup',
      status: 'Proposed visual mockups, not implemented interfaces',
      references: [
        '00-approved-homepage.jpg',
        '../../../test-results/title-correction/hero-final.jpg',
      ],
      desktopTarget: '1440 × 1100',
      mobileTarget: '390 × 1000',
      screens,
    },
    null,
    2,
  ),
);

const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const cards = (format) =>
  screens
    .filter((s) => s.format === format)
    .map(
      (s) => `
  <button class="screen ${format.toLowerCase()}" data-screen="${s.number}" aria-label="Inspect ${escape(s.title)}">
    <span class="picture"><img src="assets/${s.id}-thumb.jpg?v=footer-cleanup" alt="${escape(s.title)} steel website mockup" width="${s.width}" height="${s.height}" loading="lazy"></span>
    <span class="caption"><span class="number">${s.number}</span><span><strong>${escape(s.title)}</strong><span class="description">${escape(s.description)}</span></span><span class="inspect">Inspect</span></span>
  </button>`,
    )
    .join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light"><title>MACHINA · Steel screen collection</title>
<style>
@font-face{font-family:Anton;src:url('assets/anton.woff2')}@font-face{font-family:Source;src:url('assets/body.woff2')}
:root{--stage:#11171c;--ink:#202830;--muted:#5b6671;--paper:#f5f7f9;--line:#d4dce3;--blue:#2156d9}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:86px}body{margin:0;background:var(--paper);color:var(--ink);font-family:Source,Arial,sans-serif;font-size:17px;line-height:1.5}button,a{-webkit-tap-highlight-color:transparent}a{color:var(--blue);text-underline-offset:4px}button{font:inherit}button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #4a77eb;outline-offset:4px}header{background:var(--stage);color:#edf0f2;position:sticky;top:0;z-index:2;border-bottom:1px solid #454e59}nav{max-width:1380px;margin:auto;padding:12px 5%;display:flex;align-items:center;gap:24px;min-height:68px}nav a{color:#edf0f2;font-size:15px;text-decoration:none;min-height:44px;display:inline-flex;align-items:center}nav a:hover{text-decoration:underline}nav .wordmark{font-family:Anton,sans-serif;font-size:25px;letter-spacing:.5px;margin-right:auto}.wordmark b{color:#709bff;font-weight:400;margin-right:12px}main{max-width:1380px;margin:auto;padding:0 5% 70px}.intro{margin:0 -5.56%;padding:52px 5% 48px;background:var(--stage);color:#edf0f2}.eyebrow{text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#bdc6cf}.intro h1{font:clamp(38px,7vw,88px)/1.12 Anton,sans-serif;letter-spacing:-.5px;max-width:900px;margin:18px 0;color:#d1d5d8;background-image:url('assets/steel.webp');background-size:900px;background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent}.intro p{max-width:700px;color:#bdc6cf;margin:14px 0 22px}.intro .links{display:flex;gap:24px;flex-wrap:wrap}.intro a{color:#edf0f2;min-height:44px;display:inline-flex;align-items:center}.intro .primary{background:var(--blue);padding:10px 20px;border-radius:3px;text-decoration:none;color:white}.section-head{display:flex;align-items:baseline;gap:20px;justify-content:space-between;margin:44px 0 20px;border-bottom:1px solid var(--line);padding-bottom:12px}.section-head h2{font:32px/1.2 Anton,sans-serif;margin:0}.section-head span{font-size:14px;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 22px}.screen{width:100%;border:0;padding:0;background:transparent;text-align:left;cursor:pointer;color:var(--ink)}.picture{display:block;background:#e4e9ed;border:1px solid var(--line);overflow:hidden;aspect-ratio:1.31}.picture img{display:block;width:100%;height:100%;object-fit:contain;transition:opacity .2s}.screen:hover .picture img{opacity:.9}.caption{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--line);min-height:99px}.number{color:var(--muted);font-size:13px;padding-top:5px}.caption strong{font-size:22px;display:block}.description{font-size:15px;line-height:1.4;display:block;color:var(--muted);margin-top:3px}.inspect{margin-left:auto;padding-top:5px;color:var(--blue);font-size:14px;text-decoration:underline;text-underline-offset:4px}.mobile-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.mobile .picture{aspect-ratio:.43}.mobile .caption{min-height:120px}.mobile .caption strong{font-size:20px}.mobile .inspect{display:none}.notes{margin-top:52px;border-top:1px solid var(--line);padding-top:24px}.notes h2{font:32px/1.2 Anton,sans-serif}.notes p{max-width:830px;color:var(--muted)}details{border-bottom:1px solid var(--line);padding:0 0 16px;margin:18px 0}summary{cursor:pointer;font-weight:bold;min-height:44px;display:flex;align-items:center;list-style:none}summary::-webkit-details-marker{display:none}summary:after{content:'Open';margin-left:auto;color:var(--blue);font-size:14px;font-weight:normal}details[open] summary:after{content:'Close'}ul{padding-left:20px;max-width:900px}li{margin:8px 0}footer{background:var(--paper);color:var(--muted);border-top:1px solid var(--line);padding:25px 5%;font-size:14px}footer a{color:var(--blue)}dialog{padding:0;border:0;border-radius:3px;width:min(1520px,96vw);max-width:none;max-height:94vh;background:#e4e9ed;color:var(--ink);overflow:auto}dialog::backdrop{background:rgba(6,12,18,.88)}.viewer-bar{position:sticky;top:0;z-index:3;background:var(--stage);color:#edf0f2;display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:14px 22px;box-shadow:0 1px 0 #454e59}.viewer-bar h2{font-family:Source,Arial,sans-serif;font-size:19px;line-height:1.2;margin:0 auto 0 0}.viewer-bar button,.viewer-bar a{background:none;border:1px solid #697580;color:#edf0f2;padding:8px 12px;min-height:44px;cursor:pointer;border-radius:3px;text-decoration:none;font-size:15px}.viewer-bar button:disabled{opacity:.35;cursor:default}.viewer-bar button:hover:not(:disabled),.viewer-bar a:hover{border-color:#a9c2ff}.viewer-body{padding:22px;display:flex;justify-content:center;align-items:flex-start}.viewer-body img{display:block;width:100%;height:auto;max-width:1440px}.viewer-body img.mobile-view{max-width:440px}.viewer-note{padding:0 22px 18px;margin:0;text-align:center;color:var(--muted);font-size:14px}.noscript{display:none}.js-off .screen{cursor:default}.js-off .noscript{display:block}body:has(dialog[open]){overflow:hidden}
@media(max-width:750px){nav{gap:17px;padding:10px 5%;flex-wrap:wrap}nav a{font-size:14px}nav .wordmark{font-size:21px}.intro{padding-top:30px}.intro h1{font-size:52px}.grid{gap:22px 16px}.caption{gap:8px}.caption strong{font-size:19px}.description{font-size:14px}.inspect{display:none}.mobile-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.mobile .caption{display:block}.mobile .number{display:block}.mobile .caption strong{font-size:17px}.mobile .description{display:none}.viewer-bar{gap:9px;padding:10px}.viewer-bar h2{width:100%;margin-bottom:2px}.viewer-body{padding:8px}.section-head{margin-top:30px}.section-head h2{font-size:27px}}@media(max-width:440px){.grid:not(.mobile-grid){grid-template-columns:1fr}nav .wordmark{width:100%;min-height:28px}nav{gap:24px}.intro h1{font-size:43px}.section-head span{font-size:12px}.mobile-grid{grid-template-columns:1fr}.mobile .picture{max-height:550px;aspect-ratio:auto}.mobile .caption{display:flex}.mobile .description{display:block}.mobile .caption strong{font-size:20px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{transition:none!important;animation:none!important}}
</style></head><body class="js-off">
<header><nav aria-label="Review navigation"><a class="wordmark" href="#top"><b>///</b>MACHINA</a><a href="#desktop">Desktop</a><a href="#mobile">Mobile</a><a href="#notes">States &amp; motion</a></nav></header>
<main id="top"><section class="intro"><span class="eyebrow">Design review · 20 October 2026</span><h1>STEEL SCREEN COLLECTION</h1><p>13 proposed screens extending the approved homepage. One visual language, from browsing to the sales enquiry. Sample identity and illustrative equipment throughout.</p><div class="links"><a class="primary" href="00-approved-homepage.jpg" target="_blank" rel="noopener">Approved homepage reference</a><a href="overview.jpg?v=footer-cleanup" target="_blank" rel="noopener">View contact sheet</a><a href="README.md">Screen guide</a></div></section>
<p class="noscript">JavaScript is unavailable. Open individual PNG files from the screen guide to inspect them at full size.</p>
<section id="desktop" aria-labelledby="desktop-heading"><div class="section-head"><h2 id="desktop-heading">Desktop interfaces</h2><span>10 page layouts · Select to inspect</span></div><div class="grid">${cards('Desktop')}</div></section>
<section id="mobile" aria-labelledby="mobile-heading"><div class="section-head"><h2 id="mobile-heading">Mobile journeys</h2><span>3 responsive views</span></div><div class="grid mobile-grid">${cards('Mobile')}</div></section>
<section class="notes" id="notes"><h2>States &amp; motion</h2><p>These are static visual mockups. They show layout and art direction; the controls inside the images do not perform website actions. The current website has not been changed.</p>
<details><summary>Motion direction</summary><ul><li>Steel title bands: one short photographic entrance, with text and controls available immediately.</li><li>Image hover: a restrained 1.015 scale over 220 ms, without shifting the layout.</li><li>Gallery: transition only after selecting a photograph. No autoplay or infinite loops.</li><li>Filters and feedback: subtle transitions, clear focus and readable status messages.</li><li>Reduced-motion mode removes transforms, parallax and entrances.</li></ul></details>
<details><summary>Availability, empty results &amp; enquiries</summary><ul><li>Reserved and sold states use explicit words as well as color. Sold pages keep useful information and offer alternatives.</li><li>Empty results preserve the query and offer Reset filters and Contact sales.</li><li>Errors preserve form input and explain what to fix. A receipt appears only after the enquiry is safely stored.</li><li>Pending contact and brochure rows are preview annotations; absent destinations are hidden from the finished public site.</li></ul></details>
<details><summary>Translations, brands &amp; shared layouts</summary><ul><li>Turkish and English share the same templates. The Turkish mobile form demonstrates accented characters and longer labels.</li><li>Other categories and new-only or used-only views reuse the catalogue layout.</li><li>Brand equipment pages reuse the scoped catalogue. Brands appear in navigation only when verified content exists.</li><li>Sanity Studio remains the standard content editor, outside this public-interface mockup set.</li></ul></details>
<p><a href="README.md">Read the complete screen and interaction guide</a> · <a href="manifest.json">Image manifest</a></p></section></main>
<footer>Visual proposals for review · Sample company identity · No live enquiry submission or public deployment</footer>
<dialog id="viewer" aria-labelledby="viewer-title"><div class="viewer-bar"><h2 id="viewer-title"></h2><button id="previous" type="button">Previous</button><button id="next" type="button">Next</button><a id="original" target="_blank" rel="noopener">Full resolution</a><button id="close" type="button">Close</button></div><div class="viewer-body"><img id="viewer-image" alt=""></div><p id="viewer-description" class="viewer-note"></p></dialog>
<script>
const screens=${JSON.stringify(screens)};
document.body.classList.remove('js-off');
const viewer=document.querySelector('#viewer'),image=document.querySelector('#viewer-image');let selected=0,lastTrigger=null;
function display(index){selected=index;const screen=screens[index];document.querySelector('#viewer-title').textContent=screen.number+' / '+screen.title;image.src=screen.preview+'?v=footer-cleanup';image.alt=screen.title+' visual mockup';image.width=screen.width;image.height=screen.height;image.classList.toggle('mobile-view',screen.format==='Mobile');document.querySelector('#original').href=screen.file+'?v=footer-cleanup';document.querySelector('#viewer-description').textContent=screen.description+' · '+screen.format+' · Static mockup';document.querySelector('#previous').disabled=index===0;document.querySelector('#next').disabled=index===screens.length-1;viewer.scrollTop=0;}
document.querySelectorAll('[data-screen]').forEach(button=>button.addEventListener('click',()=>{lastTrigger=button;display(Number(button.dataset.screen)-1);viewer.showModal();document.querySelector('#close').focus();}));
document.querySelector('#close').addEventListener('click',()=>viewer.close());
document.querySelector('#previous').addEventListener('click',()=>display(Math.max(0,selected-1)));
document.querySelector('#next').addEventListener('click',()=>display(Math.min(screens.length-1,selected+1)));
viewer.addEventListener('close',()=>lastTrigger?.focus());
viewer.addEventListener('click',event=>{if(event.target===viewer&&event.offsetX<0)viewer.close();});
</script></body></html>`;
await fs.writeFile(path.join(root, 'index.html'), html);

const columns = 3,
  cellWidth = 600,
  cellHeight = 500,
  padding = 22;
const sheetItems = [
  { file: '00-approved-homepage.jpg', title: 'Approved homepage reference', number: '00' },
  ...screens,
];
const overlays = [];
for (let index = 0; index < sheetItems.length; index++) {
  const item = sheetItems[index],
    left = (index % columns) * cellWidth,
    top = Math.floor(index / columns) * cellHeight;
  const thumb = await sharp(path.join(root, item.file))
    .resize(cellWidth - padding * 2, cellHeight - 92, { fit: 'contain', background: '#e4e9ed' })
    .png()
    .toBuffer();
  overlays.push({ input: thumb, left: left + padding, top: top + 58 });
  const label =
    '<svg width="600" height="50"><text x="22" y="34" fill="#edf0f2" font-family="Arial" font-size="20">' +
    escape(item.number + ' / ' + item.title) +
    '</text></svg>';
  overlays.push({ input: Buffer.from(label), left, top });
}
await sharp({
  create: {
    width: columns * cellWidth,
    height: Math.ceil(sheetItems.length / columns) * cellHeight,
    channels: 3,
    background: '#11171c',
  },
})
  .composite(overlays)
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(root, 'overview.jpg'));
console.log(
  JSON.stringify({
    screens: screens.length,
    gallery: path.join(root, 'index.html'),
    contactSheet: path.join(root, 'overview.jpg'),
  }),
);
