import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const command = process.argv[2] || 'build';
if (!['build', 'deploy'].includes(command)) throw new Error('Use build or deploy.');
if (process.env.SANITY_PREVIEW === 'true')
  throw new Error('Authenticated drafts cannot be deployed to public Pages URLs.');
const searchPolicy = JSON.parse(
  await readFile('deployment/cloudflare/search-release.json', 'utf8'),
);
if (process.argv.includes('--review') && process.argv.includes('--search-release'))
  throw new Error('Choose review mode or search release, not both.');
const release =
  !process.argv.includes('--review') &&
  (process.argv.includes('--search-release') || searchPolicy.enabled === true);
const env = {
  ...process.env,
  PUBLIC_HOSTING: 'cloudflare',
  PUBLIC_ENQUIRY_PROVIDER: 'formspree',
  PUBLIC_SITE_URL: 'https://technicsan.com',
  PUBLIC_BASE_PATH: '/',
  CONTENT_SOURCE: 'sanity',
  SANITY_PREVIEW: 'false',
  PUBLIC_LAUNCH_READY: String(release),
};
const run = (args) => {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
};
if (release) run(['scripts/verify-launch.mjs']);
if (!process.argv.includes('--skip-build')) {
  run(['scripts/astro.mjs', 'check']);
  run(['scripts/astro.mjs', 'build']);
  run(['scripts/postbuild.mjs']);
}
run(['scripts/verify-build.mjs']);
const html = await readFile('dist/en/contact/index.html', 'utf8');
if (!html.includes('data-delivery="formspree"') || !html.includes('https://formspree.io/f/'))
  throw new Error('Cloudflare deployment requires the working sales enquiry endpoint.');
await readFile('dist/_worker.js', 'utf8');
if (command === 'deploy') {
  // The dedicated project root prevents deployment of the unused legacy D1 Functions.
  run([
    'node_modules/wrangler/bin/wrangler.js',
    '--cwd',
    'deployment/cloudflare',
    'pages',
    'deploy',
    '../../dist',
    '--project-name',
    env.CLOUDFLARE_PAGES_PROJECT || 'technicsan',
    '--branch',
    'main',
    '--commit-dirty=true',
  ]);
}
