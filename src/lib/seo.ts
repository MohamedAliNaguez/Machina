import type { Content, Locale, SeoFields } from './types';
import { companyHistory } from '../data/history';
import { paths, url } from './i18n';
import {
  companySearchIssues,
  brandSearchIssues,
  seoIssues,
  categorySearchIssues,
  productSearchIssues,
  articleSearchIssues,
} from './seo-policy';
export * from './seo-policy';
const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim();
export type SeoPage = {
  locale: Locale;
  kind: string;
  seo?: SeoFields;
  issues: string[];
  family?: string;
};
export function resolveSeoPage(content: Content, pathname: string): SeoPage {
  const parts = pathname.split('/').filter(Boolean);
  const start = parts.findIndex((p) => p === 'en' || p === 'tr');
  const locale: Locale = parts[start] === 'tr' ? 'tr' : 'en';
  const [section, slug] = parts.slice(start + 1);
  const brandOnly = content.settings.searchReleaseMode === 'brand-only';
  const common = brandOnly ? brandSearchIssues(content) : companySearchIssues(content);
  if (!brandOnly && !text(content.settings.about?.[locale]))
    common.push(`Approve the ${locale} company description`);
  if (!brandOnly && !text(content.settings.privacyNotice?.[locale]))
    common.push(`Approve the ${locale} privacy notice`);
  let kind = 'excluded';
  let seo: SeoFields | undefined;
  let issues: string[] = ['This route is not an editorial search landing page'];
  let family: string | undefined;
  if (
    start >= 0 &&
    (!section || section === paths.about[locale] || section === paths.contact[locale])
  ) {
    kind = !section ? 'home' : section === paths.about[locale] ? 'about' : 'contact';
    seo = content.settings.pageSeo?.[kind as 'home' | 'about' | 'contact'];
    issues = seoIssues(seo, locale);
    if (kind === 'about' && !companyHistory.approved && !content.settings.historyApproved)
      issues.push('Review the visible company history');
  } else if (section === paths.categories[locale] && slug) {
    const category = content.categories.find((c) => c.slug[locale] === slug);
    if (category) {
      kind = 'category';
      seo = category;
      family = category.id;
      issues = categorySearchIssues(category, locale);
    }
  } else if (section === paths.machines[locale] && slug) {
    const product = content.machines.find((p) => p.slug[locale] === slug);
    if (product) {
      kind = 'product';
      seo = product;
      family = product.categoryId;
      issues = productSearchIssues(product, locale);
    }
  } else if (section === paths.guides[locale]) {
    if (slug) {
      const article = content.articles.find((a) => a.slug[locale] === slug);
      if (article) {
        kind = 'article';
        seo = article;
        family = article.categoryId;
        issues = articleSearchIssues(article, locale);
      }
    } else {
      kind = 'guides';
      issues = content.articles.some((a) => !articleSearchIssues(a, locale).length)
        ? []
        : ['Publish at least one approved guide'];
    }
  }
  if (brandOnly && !['home', 'contact'].includes(kind))
    common.push('Brand-only release is limited to Home and Contact');
  return { locale, kind, seo, family, issues: [...common, ...issues] };
}
export function searchReleasePages(content: Content) {
  return (['en', 'tr'] as Locale[]).flatMap((locale) =>
    [
      url(locale),
      url(locale, 'about'),
      url(locale, 'contact'),
      url(locale, 'guides'),
      ...content.categories.map((c) => url(locale, 'categories', c.slug[locale])),
      ...content.machines
        .filter((p) => p.published.includes(locale))
        .map((p) => url(locale, 'machines', p.slug[locale])),
      ...content.articles
        .filter((a) => a.published.includes(locale))
        .map((a) => url(locale, 'guides', a.slug[locale])),
    ].map((path) => ({ path, ...resolveSeoPage(content, path) })),
  );
}
