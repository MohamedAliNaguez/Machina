import { sanityConfig, sanityContentQuery } from '../src/lib/sanity';
import { validateContent } from '../src/lib/content';
try {
  process.loadEnvFile();
} catch {}
const project = process.env.SANITY_PROJECT_ID || sanityConfig.projectId;
const dataset = process.env.SANITY_DATASET || sanityConfig.dataset;
const endpoint = new URL(`https://${project}.api.sanity.io/v2025-02-19/data/query/${dataset}`);
endpoint.searchParams.set('query', sanityContentQuery);
endpoint.searchParams.set('perspective', 'published');
const response = await fetch(endpoint, { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`Sanity connection failed (${response.status}).`);
const { result } = await response.json();
validateContent(result, false);
console.log(
  `Sanity connected: ${result.categories.length} families, ${result.machines.length} products, ${result.articles.length} guides. Published content validated; website remains a preview.`,
);
