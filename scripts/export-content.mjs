import { mkdir, writeFile, readFile } from 'node:fs/promises';
try {
  process.loadEnvFile();
} catch {}
const project = process.env.SANITY_PROJECT_ID;
if (!project) throw new Error('Set SANITY_PROJECT_ID. No export was created.');
const token = process.env.SANITY_READ_TOKEN;
if (!token) throw new Error('A read token is required for a complete authenticated export.');
const endpoint = `https://${project}.api.sanity.io/v2025-02-19/data/export/${encodeURIComponent(process.env.SANITY_DATASET || 'production')}`;
const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
if (!response.ok) throw new Error(`Export failed (${response.status}).`);
await mkdir('exports', { recursive: true });
const target = `exports/content-${new Date().toISOString().replace(/[:.]/g, '-')}.ndjson`;
await writeFile(target, await response.text());
console.log(
  `Saved ${target}. Download referenced image/file assets separately; see docs/OPERATIONS.md.`,
);
