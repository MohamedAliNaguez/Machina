import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import net from 'node:net';
const local = process.argv.includes('--local');
const origin = local
  ? process.env.PERF_BASE_URL || 'http://127.0.0.1:4334'
  : 'https://technicsan.com';
if (local && !['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
  throw new Error('Local baseline accepts loopback hosts only.');
// Certificate verification stays enabled. A broken production certificate is a failed preflight.
const check = await fetch(origin, { signal: AbortSignal.timeout(20000) });
if (!check.ok) throw new Error(`Baseline preflight failed: ${check.status}`);
const folder = resolve('.local/lighthouse/' + new Date().toISOString().replaceAll(':', '-'));
await mkdir(folder, { recursive: true });
const pages = {
  home: '/en/',
  category: '/en/categories/lpg-catalog/',
  product: '/en/products/v-type-silobas/',
  contact: '/en/contact/',
  about: '/en/about/',
};
const selected = process.argv
  .find((arg) => arg.startsWith('--pages='))
  ?.slice(8)
  .split(',');
if (selected?.some((name) => !(name in pages))) throw new Error('Unknown baseline page.');
const results = [];
const debugPort = await new Promise((done, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    server.close(() => done(port));
  });
});
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || undefined,
  args: [`--remote-debugging-port=${debugPort}`],
});
try {
  for (const [name, path] of Object.entries(pages).filter(
    ([name]) => !selected || selected.includes(name),
  ))
    for (const device of ['mobile', 'desktop']) {
      const output = resolve(folder, `${name}-${device}.json`);
      console.log(`Measuring ${device} ${path}`);
      const args = [
        'node_modules/lighthouse/cli/index.js',
        new URL(path, origin).href,
        '--output=json',
        `--output-path=${output}`,
        '--only-categories=performance,accessibility',
        `--port=${debugPort}`,
        '--hostname=127.0.0.1',
        '--quiet',
      ];
      if (device === 'desktop') args.push('--preset=desktop');
      await new Promise((done, reject) => {
        const child = spawn(process.execPath, args, {
          stdio: 'inherit',
          env: process.env,
          windowsHide: true,
        });
        child.on('error', reject);
        child.on('exit', (code) =>
          code === 0
            ? done()
            : reject(new Error(`Lighthouse failed for ${name} ${device}: ${code}`)),
        );
      });
      const report = JSON.parse(await readFile(output, 'utf8'));
      if (report.runtimeError) throw new Error(report.runtimeError.message);
      const row = {
        page: name,
        device,
        url: report.finalDisplayedUrl,
        performance: report.categories.performance.score,
        accessibility: report.categories.accessibility.score,
        lcpMs: report.audits['largest-contentful-paint'].numericValue,
        cls: report.audits['cumulative-layout-shift'].numericValue,
        tbtMs: report.audits['total-blocking-time'].numericValue,
        transferBytes: report.audits['total-byte-weight']?.numericValue,
      };
      results.push(row);
      console.log(JSON.stringify(row));
    }
  await writeFile(
    resolve(folder, 'summary.json'),
    JSON.stringify(
      {
        origin,
        local,
        capturedAt: new Date().toISOString(),
        lighthouseVersion: JSON.parse(
          await readFile('node_modules/lighthouse/package.json', 'utf8'),
        ).version,
        note: 'Single cold-navigation diagnostic per page/device. Lab TBT is not field INP; these results do not establish real-user Core Web Vitals.',
        results,
      },
      null,
      2,
    ),
  );
  console.log(`Baseline saved in ${folder}`);
} finally {
  await browser.close();
}
