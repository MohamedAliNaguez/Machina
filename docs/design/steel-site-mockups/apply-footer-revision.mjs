import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const revision = JSON.parse(await fs.readFile(path.join(root, 'footer-revision.json'), 'utf8'));
const screens = JSON.parse(await fs.readFile(path.join(root, 'screens.json'), 'utf8'));
for (const edit of revision.edits) {
  const screen = screens.find((entry) => entry.id === edit.id);
  if (!screen) throw new Error(`Unknown screen ${edit.id}`);
  if (screen.source !== edit.source) {
    screen.previousSource = screen.source;
    screen.source = edit.source;
  }
  screen.revision = revision.revision;
}
await fs.writeFile(path.join(root, 'screens.json'), JSON.stringify(screens, null, 2));

const generatorPath = path.join(root, 'prepare-gallery.mjs');
let generator = await fs.readFile(generatorPath, 'utf8');
generator = generator.replace(
  'footer{background:var(--stage);color:#bdc6cf;',
  'footer{background:var(--paper);color:var(--muted);border-top:1px solid var(--line);',
);
generator = generator.replace('footer a{color:#edf0f2}', 'footer a{color:var(--blue)}');
generator = generator.replace(
  'src="assets/${s.id}-thumb.jpg"',
  'src="assets/${s.id}-thumb.jpg?v=footer-cleanup"',
);
generator = generator.replace(
  'image.src=screen.preview;',
  "image.src=screen.preview+'?v=footer-cleanup';",
);
generator = generator.replace('href=screen.file;', "href=screen.file+'?v=footer-cleanup';");
generator = generator.replace('href="overview.jpg"', 'href="overview.jpg?v=footer-cleanup"');
generator = generator.replace(
  "created: '2026-10-20', status:",
  "created: '2026-10-20', revision: 'footer-cleanup', status:",
);
await fs.writeFile(generatorPath, generator);
console.log(
  `Updated ${revision.edits.length} desktop image references and removed the gallery's dark closing strip`,
);
