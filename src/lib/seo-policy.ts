import { sectionComplete } from './guides';
import type { Article, Category, Content, Locale, Machine, SeoFields } from './types';
const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim();
const date = (value: unknown) =>
  text(value) && Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now();
export function companySearchIssues(content: Content): string[] {
  const s = content.settings;
  return [
    !s.identityVerified && 'Verify the company identity',
    !text(s.legalName) && 'Add the legal business name',
    !text(s.address) && 'Add the public factory/contact address',
    !text(s.city) && 'Add the company city',
    !s.manufacturerVerified && 'Confirm the manufacturing role against company evidence',
    !text(s.email) && 'Add a working sales email',
    !text(s.phone) && 'Add a working sales phone',
    !s.privacyReviewed && 'Complete the company privacy review',
  ].filter(Boolean) as string[];
}
export function seoIssues(seo: SeoFields | undefined, locale: Locale): string[] {
  return [
    seo?.seoApproval?.[locale] !== 'approved' && `Approve SEO for ${locale}`,
    !text(seo?.seoTitle?.[locale]) && `Add the ${locale} SEO title`,
    !text(seo?.seoDescription?.[locale]) && `Add the ${locale} SEO description`,
  ].filter(Boolean) as string[];
}
export function productSearchIssues(machine: Machine, locale: Locale): string[] {
  return [
    ...seoIssues(machine, locale),
    !machine.published.includes(locale) && 'Publish this translation',
    machine.sample && 'Reconcile imported/sample information with actual TECHNICSAN equipment',
    machine.technicalReview !== 'approved' && 'Approve the technical information',
    machine.reference?.reviewStatus === 'pending' && 'Review the original technical reference',
    !machine.specs.length && 'Add verified technical specifications',
    (!text(machine.name?.[locale]) ||
      !text(machine.summary?.[locale]) ||
      !text(machine.description?.[locale]) ||
      !machine.applications?.[locale]?.length ||
      machine.specs.some((s) => !text(s.label?.[locale]) || !text(s.value))) &&
      'Complete the translated product facts',
    !machine.images.some(
      (i) =>
        !i.illustrative && !i.placeholder && i.rightsStatus === 'approved' && text(i.alt?.[locale]),
    ) && 'Add at least one genuine photograph with approved rights and translated description',
    machine.images.some((i) => !i.placeholder && i.rightsStatus !== 'approved') &&
      'Approve rights for every displayed product image',
    machine.kind === 'used' &&
      (machine.year === undefined ||
        machine.hours === undefined ||
        !text(machine.condition?.[locale])) &&
      'Complete the individual used-unit facts',
  ].filter(Boolean) as string[];
}
export function articleSearchIssues(article: Article, locale: Locale): string[] {
  return [
    ...seoIssues(article, locale),
    !article.published.includes(locale) && 'Publish this translation',
    article.sample && 'Complete the original writing and technical review',
    !text(article.author) && 'Name the actual author',
    !text(article.reviewer) && 'Name the actual technical reviewer',
    !text(article.imageAlt?.[locale]) && 'Describe the article image in this language',
    !date(article.publishedAt) && 'Record the actual publication date',
    !date(article.reviewedAt) && 'Record the actual review date',
    (!article.sources?.length ||
      article.sources.some((s) => !text(s.title) || !/^https:\/\//.test(s.url))) &&
      'Add supporting sources',
    (!text(article.title?.[locale]) ||
      !text(article.excerpt?.[locale]) ||
      !article.sections?.length ||
      article.sections.some((s) => !sectionComplete(s, locale))) &&
      'Complete this article translation',
  ].filter(Boolean) as string[];
}
export function categorySearchIssues(category: Category, locale: Locale): string[] {
  const e = category.editorial;
  return [
    ...seoIssues(category, locale),
    !(category.published ?? ['en', 'tr']).includes(locale) && 'Publish this translation',
    (!text(e?.heading?.[locale]) ||
      !text(e?.overview?.[locale]) ||
      !e?.sections?.length ||
      e.sections.some((s) => !text(s.heading?.[locale]) || !text(s.text?.[locale]))) &&
      'Complete the category explanation and selection advice',
    (!e?.questions?.length ||
      e.questions.some((q) => !text(q.question?.[locale]) || !text(q.answer?.[locale]))) &&
      'Complete the buyer questions',
    !text(e?.evidence?.[locale]) && 'Add reviewed production evidence for this product family',
  ].filter(Boolean) as string[];
}
