import { repositoryContent } from '../src/data/repository';
import { validateHistoryApproval } from '../src/data/history';
import { validateContent } from '../src/lib/content';
import { validateEnquirySetup } from '../src/lib/launch-enquiries';
import delivery from '../src/data/enquiry-delivery.json';
import type { Content } from '../src/lib/types';
try {
  process.loadEnvFile();
} catch {}
const env = process.env;
const origin = new URL(env.PUBLIC_SITE_URL || 'http://localhost');
if (origin.protocol !== 'https:' || origin.username || origin.password)
  throw new Error('Production requires an HTTPS origin.');
if (env.SANITY_PREVIEW === 'true') throw new Error('Draft previews cannot be launched.');
const enquiryProvider = validateEnquirySetup({
  hosting: env.PUBLIC_HOSTING || '',
  formId: env.PUBLIC_FORMSPREE_FORM_ID ?? delivery.formspreeFormId,
});
let content: Content;
if (env.CONTENT_SOURCE === 'repository') content = repositoryContent;
else if (env.CONTENT_SOURCE === 'sanity') {
  const project = env.SANITY_PROJECT_ID;
  if (!project || !/^[a-z0-9]+$/.test(project)) throw new Error('Valid Sanity project required.');
  const endpoint = new URL(
    `https://${project}.api.sanity.io/v2025-02-19/data/query/${encodeURIComponent(env.SANITY_DATASET || 'production')}`,
  );
  endpoint.searchParams.set('perspective', 'published');
  endpoint.searchParams.set(
    'query',
    `{
    "settings": *[_type=="siteSettings"][0], "categories": *[_type=="category"], "brands": *[_type=="brand"],
    "machines": *[_type in ["newModel","usedMachine"]]{..., "kind":select(_type=="newModel"=>"new","used"), "categoryId":category->id,"images":images[]{...,"src":asset->url},"brochure":brochure{...,"url":asset->url}},
    "articles": *[_type=="article"]{...,"categoryId":category->id,"image":image.asset->url}
  }`,
  );
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Content verification failed (${response.status}).`);
  content = (await response.json()).result;
} else throw new Error('Choose repository or sanity published content.');
validateContent(content, true, { enquiryProvider });
validateHistoryApproval();
console.log(
  'Content and delivery configuration passed. Before publishing, verify real inbox delivery, domain/HTTPS, privacy, rollback and content recovery. No email was sent by this check.',
);
