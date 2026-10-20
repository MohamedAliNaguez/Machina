import { sampleContent } from '../data/sample';
import type { Content, Locale } from './types';

const buildEnv = import.meta.env ?? {};
export const isDraftPreview = buildEnv.SANITY_PREVIEW === 'true';
export const launchReady = buildEnv.PUBLIC_LAUNCH_READY === 'true';
let pending: Promise<Content> | undefined;
export function getContent(): Promise<Content> {
  return (pending ??= load());
}
async function load(): Promise<Content> {
  if (buildEnv.CONTENT_SOURCE !== 'sanity') {
    if (launchReady)
      throw new Error('Launch blocked: sample content cannot be published as a live company.');
    return sampleContent;
  }
  const project = buildEnv.SANITY_PROJECT_ID;
  const dataset = buildEnv.SANITY_DATASET || 'production';
  if (!project || !/^[a-z0-9]+$/.test(project))
    throw new Error('A valid SANITY_PROJECT_ID is required.');
  if (isDraftPreview && !buildEnv.SANITY_READ_TOKEN)
    throw new Error('Draft previews require an authenticated SANITY_READ_TOKEN.');
  if (isDraftPreview && launchReady) throw new Error('Draft previews must never be launch-ready.');
  const query = `{
    "settings": *[_type == "siteSettings"][0]{..., "heroImage": heroImage{..., "src": asset->url}},
    "categories": *[_type == "category"],
    "brands": *[_type == "brand"],
    "machines": *[_type in ["newModel", "usedMachine"]]{..., "kind": select(_type == "newModel" => "new", "used"), "categoryId": category->id, "brandId": brand->id, "images": images[]{..., "src": asset->url}, "brochure": brochure{..., "url": asset->url}},
    "articles": *[_type == "article"]{..., "categoryId": category->id, "image": image.asset->url}
  }`;
  const endpoint = new URL(
    `https://${project}.api.sanity.io/v2025-02-19/data/query/${encodeURIComponent(dataset)}`,
  );
  endpoint.searchParams.set('query', query);
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
  validateContent(result, launchReady);
  return result;
}
export function validateContent(value: Content, live: boolean) {
  if (
    !value?.settings ||
    !Array.isArray(value.machines) ||
    !Array.isArray(value.categories) ||
    !Array.isArray(value.articles) ||
    !Array.isArray(value.brands)
  )
    throw new Error('Content is incomplete.');
  if (
    live &&
    (!value.settings.identityVerified ||
      !value.settings.privacyReviewed ||
      !value.settings.legalName ||
      !value.settings.email)
  )
    throw new Error('Launch blocked: verify identity, contact information and privacy review.');
  if (
    live &&
    (!value.settings.about?.tr ||
      !value.settings.about?.en ||
      !value.settings.privacyNotice?.tr ||
      !value.settings.privacyNotice?.en ||
      !value.settings.heroImage?.src ||
      value.settings.heroImage.illustrative ||
      !value.settings.turnstileSiteKey)
  )
    throw new Error(
      'Launch blocked: approved bilingual company/privacy copy and a genuine hero image are required.',
    );
  const ids = new Set<string>();
  for (const item of [...value.machines, ...value.categories, ...value.articles]) {
    if (!item.id || ids.has(item.id)) throw new Error('Content IDs must be unique.');
    ids.add(item.id);
    if (!item.slug?.tr || !item.slug?.en) throw new Error(`Missing slugs on ${item.id}.`);
    for (const slug of Object.values(item.slug))
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid slug on ${item.id}.`);
  }
  for (const machine of value.machines) {
    if (
      !machine.published?.length ||
      !machine.images?.length ||
      !machine.specs?.length ||
      !machine.source ||
      !machine.name?.tr ||
      !machine.name?.en ||
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
        machine.images.some((i) => !i.alt?.[locale]) ||
        machine.specs.some((s) => !s.label?.[locale] || !s.value)
      )
        throw new Error(`Incomplete ${locale} translation on ${machine.id}.`);
    }
    if (
      machine.images.some((i) => !safeMediaUrl(i.src)) ||
      (machine.brochure && !safeMediaUrl(machine.brochure.url))
    )
      throw new Error(`Invalid media URL on ${machine.id}.`);
    if (live && (machine.sample || machine.images.some((i) => i.illustrative)))
      throw new Error(`Launch blocked: sample machine or illustrative image ${machine.id}.`);
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
  }
  if (live && value.articles.some((a) => a.sample || !a.author || !a.reviewedAt))
    throw new Error('Launch blocked: articles require an author and review date.');
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
