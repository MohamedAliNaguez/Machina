import { repositoryContent } from '../data/repository';
import { companySearchIssues } from './seo';
import { verifySearchTransport } from './search-transport';
import delivery from '../data/enquiry-delivery.json';
import { validateEnquirySetup } from './launch-enquiries';
import { resolveEnquiryProvider } from './enquiry-provider';
import { sampleContent } from '../data/sample';
import { productTypeIds } from '../data/product-types';
import type { Content, Locale } from './types';
import { sanityConfig, sanityContentQuery } from './sanity';

const buildEnv = import.meta.env ?? {};
export const isDraftPreview = buildEnv.SANITY_PREVIEW === 'true';
export const launchReady = buildEnv.PUBLIC_LAUNCH_READY === 'true';
let pending: Promise<Content> | undefined;
let loadedAt = 0;
export function getContent(): Promise<Content> {
  // Refresh published CMS content on local page reloads; production builds share one snapshot.
  if (buildEnv.DEV && Date.now() - loadedAt > 2000) pending = undefined;
  if (!pending) {
    loadedAt = Date.now();
    pending = load().catch((error) => {
      pending = undefined;
      throw error;
    });
  }
  return pending;
}
async function load(): Promise<Content> {
  if (launchReady) await verifySearchTransport(buildEnv.PUBLIC_SITE_URL || '');
  const source = buildEnv.CONTENT_SOURCE || 'sanity';
  const provider =
    resolveEnquiryProvider({
      hosting: buildEnv.PUBLIC_HOSTING || 'local',
      provider: buildEnv.PUBLIC_ENQUIRY_PROVIDER,
    }) === 'formspree'
      ? 'formspree'
      : 'cloudflare';
  if (launchReady)
    validateEnquirySetup({
      hosting: buildEnv.PUBLIC_HOSTING || '',
      provider: buildEnv.PUBLIC_ENQUIRY_PROVIDER,
      formId: buildEnv.PUBLIC_FORMSPREE_FORM_ID ?? delivery.formspreeFormId,
    });
  if (source === 'repository') {
    if (isDraftPreview)
      throw new Error('Repository content does not support Sanity draft previews.');
    validateContent(repositoryContent, launchReady, { enquiryProvider: provider });
    return repositoryContent;
  }
  if (source !== 'sanity' && source !== 'sample') throw new Error('Unknown content source.');
  if (source === 'sample') {
    if (launchReady)
      throw new Error('Launch blocked: sample content cannot be published as a live company.');
    validateContent(sampleContent, false);
    return sampleContent;
  }
  const project = buildEnv.SANITY_PROJECT_ID || sanityConfig.projectId;
  const dataset = buildEnv.SANITY_DATASET || sanityConfig.dataset;
  if (!project || !/^[a-z0-9]+$/.test(project))
    throw new Error('A valid SANITY_PROJECT_ID is required.');
  if (isDraftPreview && !buildEnv.SANITY_READ_TOKEN)
    throw new Error('Draft previews require an authenticated SANITY_READ_TOKEN.');
  if (isDraftPreview && launchReady) throw new Error('Draft previews must never be launch-ready.');
  const endpoint = new URL(
    `https://${project}.api.sanity.io/v2025-02-19/data/query/${encodeURIComponent(dataset)}`,
  );
  endpoint.searchParams.set('query', sanityContentQuery);
  endpoint.searchParams.set('perspective', isDraftPreview ? 'drafts' : 'published');
  const response = await fetch(endpoint, {
    headers: buildEnv.SANITY_READ_TOKEN
      ? { Authorization: `Bearer ${buildEnv.SANITY_READ_TOKEN}` }
      : {},
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(`Sanity content unavailable (${response.status}). No sample fallback used.`);
  const { result } = await response.json();
  validateContent(result, launchReady, { enquiryProvider: provider });
  result.categories.sort(
    (a: Content['categories'][number], b: Content['categories'][number]) =>
      productTypeIds.indexOf(a.id) - productTypeIds.indexOf(b.id),
  );
  return result;
}
export function validateContent(
  value: Content,
  live: boolean,
  options: { enquiryProvider?: 'cloudflare' | 'formspree' } = {},
) {
  if (
    !value?.settings ||
    !Array.isArray(value.machines) ||
    !Array.isArray(value.categories) ||
    !Array.isArray(value.articles) ||
    !Array.isArray(value.brands)
  )
    throw new Error('Content is incomplete.');
  if (
    value.categories.length !== productTypeIds.length ||
    productTypeIds.some((id) => !value.categories.some((category) => category.id === id))
  )
    throw new Error('Catalogue must contain exactly the five approved TECHNICSAN product types.');
  if (live) {
    const issues = companySearchIssues(value);
    if (options.enquiryProvider !== 'formspree' && !value.settings.turnstileSiteKey)
      issues.push('Configure the enquiry challenge');
    if (issues.length) throw new Error(`Launch blocked: ${issues.join('; ')}.`);
  }
  const ids = new Set<string>();
  for (const item of [...value.machines, ...value.categories, ...value.articles]) {
    if (!item.id || ids.has(item.id)) throw new Error('Content IDs must be unique.');
    ids.add(item.id);
    if (!item.slug?.tr || !item.slug?.en) throw new Error(`Missing slugs on ${item.id}.`);
    for (const slug of Object.values(item.slug))
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid slug on ${item.id}.`);
    if (
      item.seoApproval &&
      Object.values(item.seoApproval).some((status) => !['pending', 'approved'].includes(status))
    )
      throw new Error(`Invalid search approval on ${item.id}.`);
  }
  for (const category of value.categories) {
    for (const locale of category.published ?? (['en', 'tr'] as Locale[]))
      if (
        !['en', 'tr'].includes(locale) ||
        !category.name?.[locale] ||
        !category.description?.[locale]
      )
        throw new Error(`Incomplete ${locale} category ${category.id}.`);
  }
  for (const machine of value.machines) {
    if (
      !machine.published?.length ||
      !machine.images?.length ||
      !Array.isArray(machine.specs) ||
      (!machine.sample && !machine.specs.length) ||
      !machine.source ||
      !value.categories.some((c) => c.id === machine.categoryId)
    )
      throw new Error(`Incomplete machine ${machine.id}.`);
    if (
      machine.kind === 'used' &&
      (machine.year === undefined || machine.hours === undefined || !machine.condition)
    )
      throw new Error(`Missing used-machine facts on ${machine.id}.`);
    if (
      !['new', 'used'].includes(machine.kind) ||
      !['available', 'reserved', 'sold'].includes(machine.status)
    )
      throw new Error(`Invalid machine lifecycle on ${machine.id}.`);
    for (const locale of machine.published) {
      if (
        !['tr', 'en'].includes(locale) ||
        !machine.name[locale] ||
        !machine.summary?.[locale] ||
        !machine.description?.[locale] ||
        !machine.applications?.[locale]?.length ||
        (machine.kind === 'used' && !machine.condition?.[locale]) ||
        machine.images.some((i) => !i.alt?.[locale]) ||
        machine.specs.some((s) => !s.label?.[locale] || !s.value)
      )
        throw new Error(`Incomplete ${locale} translation on ${machine.id}.`);
      if (
        !(
          value.categories.find((c) => c.id === machine.categoryId)?.published ?? ['en', 'tr']
        ).includes(locale)
      )
        throw new Error(`Publish the ${locale} category before ${machine.id}.`);
    }
    if (
      machine.images.some((i) => !safeMediaUrl(i.src)) ||
      (machine.brochure &&
        !safeMediaUrl(machine.brochure.url) &&
        !safeExternalUrl(machine.brochure.url))
    )
      throw new Error(`Invalid media URL on ${machine.id}.`);
    if (
      machine.reference &&
      (!safeExternalUrl(machine.reference.url) ||
        !machine.reference.publisher ||
        !/^\d{4}-\d{2}-\d{2}$/.test(machine.reference.retrievedAt) ||
        !['pending', 'approved'].includes(machine.reference.reviewStatus))
    )
      throw new Error(`Invalid product reference ${machine.id}.`);
    if (
      machine.images.some(
        (image) =>
          image.sourceUrl &&
          (!safeExternalUrl(image.sourceUrl) ||
            !image.credit ||
            !['pending', 'approved'].includes(image.rightsStatus || '')),
      )
    )
      throw new Error(`Invalid image attribution ${machine.id}.`);
    if (
      machine.specificationTable &&
      (!machine.specificationTable.columns.length ||
        !machine.specificationTable.rows.length ||
        machine.specificationTable.rows.some(
          (row) =>
            !row.label.tr ||
            !row.label.en ||
            row.values.length !== machine.specificationTable!.columns.length ||
            row.values.some((cell) => !cell),
        ))
    )
      throw new Error(`Invalid specification table ${machine.id}.`);
  }
  for (const article of value.articles) {
    if (!article.published?.length || !article.sections?.length || !safeMediaUrl(article.image))
      throw new Error(`Incomplete article ${article.id}.`);
    for (const locale of article.published)
      if (
        !article.title?.[locale] ||
        !article.excerpt?.[locale] ||
        article.sections.some((s) => !s.heading?.[locale] || !s.text?.[locale])
      )
        throw new Error(`Incomplete ${locale} article ${article.id}.`);
    if (article.sources?.some((source) => !source.title || !safeExternalUrl(source.url)))
      throw new Error(`Invalid article source ${article.id}.`);
  }
  for (const group of [value.machines, value.categories, value.articles])
    for (const locale of ['tr', 'en'] as Locale[]) {
      const slugs = group.map((item) => item.slug[locale]);
      if (new Set(slugs).size !== slugs.length) throw new Error(`Duplicate ${locale} slugs.`);
    }
}
function safeMediaUrl(value: string) {
  return (
    typeof value === 'string' &&
    (value.startsWith('/images/') || /^https:\/\/cdn\.sanity\.io\//.test(value))
  );
}
function safeExternalUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}
