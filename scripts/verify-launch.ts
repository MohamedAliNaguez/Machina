import { repositoryContent } from '../src/data/repository';
import { validateContent } from '../src/lib/content';
import { validateEnquirySetup } from '../src/lib/launch-enquiries';
import { sanityConfig, sanityContentQuery } from '../src/lib/sanity';
import { searchReleasePages } from '../src/lib/seo';
import { verifySearchTransport } from '../src/lib/search-transport';
import delivery from '../src/data/enquiry-delivery.json';
import type { Content } from '../src/lib/types';
try {
  process.loadEnvFile();
} catch {}
const env = process.env;
const auditOnly = process.argv.includes('--audit');
let content: Content;
if (env.CONTENT_SOURCE === 'repository') content = repositoryContent;
else {
  const project = env.SANITY_PROJECT_ID || sanityConfig.projectId;
  const dataset = env.SANITY_DATASET || sanityConfig.dataset;
  if (!/^[a-z0-9]+$/.test(project)) throw new Error('Valid Sanity project required.');
  const endpoint = new URL(
    `https://${project}.api.sanity.io/v2025-02-19/data/query/${encodeURIComponent(dataset)}`,
  );
  endpoint.searchParams.set('perspective', 'published');
  endpoint.searchParams.set('query', sanityContentQuery);
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(20000) });
  if (!response.ok)
    throw new Error(
      `Content verification failed (${response.status}). No sample substitution used.`,
    );
  content = (await response.json()).result;
}
validateContent(content, false);
const pages = searchReleasePages(content);
const eligible = pages.filter((p) => !p.issues.length);
console.log(
  `Search readiness: ${eligible.length}/${pages.length} editorial pages eligible by content. Catalogue filters stay excluded.`,
);
for (const page of pages)
  console.log(
    `${page.issues.length ? 'PENDING' : 'READY'} ${page.path}${page.issues.length ? ': ' + page.issues.join('; ') : ''}`,
  );
if (!auditOnly) {
  const origin = env.PUBLIC_SITE_URL || '';
  if (origin !== 'https://technicsan.com' || env.SANITY_PREVIEW === 'true')
    throw new Error('Search release requires the production HTTPS origin and published content.');
  const enquiryProvider = validateEnquirySetup({
    hosting: env.PUBLIC_HOSTING || '',
    provider: env.PUBLIC_ENQUIRY_PROVIDER,
    formId: env.PUBLIC_FORMSPREE_FORM_ID ?? delivery.formspreeFormId,
  });
  validateContent(content, true, { enquiryProvider });
  if (!eligible.length)
    throw new Error(
      'No approved pages are ready for search. Complete the Studio readiness checks first.',
    );
  await verifySearchTransport(origin);
  console.log(
    `Release preflight passed for ${eligible.length} pages. No email was sent. Verify inbox delivery, recovery and URL Inspection after deployment.`,
  );
}
