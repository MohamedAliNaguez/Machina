try {
  process.loadEnvFile();
} catch {}
const missing = ['PUBLIC_SITE_URL', 'SANITY_PROJECT_ID', 'SANITY_DATASET'].filter(
  (key) => !process.env[key],
);
if (missing.length) throw new Error(`Missing configuration names: ${missing.join(', ')}`);
if (!process.env.PUBLIC_SITE_URL.startsWith('https://'))
  throw new Error('Production requires an HTTPS origin.');
if (process.env.CONTENT_SOURCE !== 'sanity' || process.env.SANITY_PREVIEW === 'true')
  throw new Error('Production requires published Sanity content.');
const query =
  '{"settings": *[_type=="siteSettings"][0], "sampleCount":count(*[sample==true && _type in ["newModel","usedMachine","article"]]), "machineCount":count(*[_type in ["newModel","usedMachine"]])}';
const endpoint = new URL(
  `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v2025-02-19/data/query/${process.env.SANITY_DATASET}`,
);
endpoint.searchParams.set('query', query);
endpoint.searchParams.set('perspective', 'published');
const response = await fetch(endpoint);
if (!response.ok) throw new Error(`Content verification failed (${response.status}).`);
const { result } = await response.json();
if (
  !result.settings?.identityVerified ||
  !result.settings?.privacyReviewed ||
  !result.settings?.legalName ||
  !result.settings?.email ||
  !result.settings?.turnstileSiteKey ||
  result.sampleCount ||
  result.machineCount < 1
)
  throw new Error(
    'Launch blocked: complete verified identity/contact/privacy, challenge setup and genuine machine content.',
  );
console.log(
  'Published-content launch preflight passed. Also verify deployed enquiry secrets, notifications, translations and company approval before enabling production.',
);
