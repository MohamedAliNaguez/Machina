import type { Article, Locale, Localized } from './types';
export interface GuideBlock {
  kind: 'paragraph' | 'list' | 'table' | 'figure' | 'checklist';
  text?: Localized;
  items?: Localized[];
  columns?: Localized[];
  rows?: { cells: Localized[] }[];
  image?: { src: string; alt: Localized; asset?: { _ref: string } };
  caption?: Localized;
}
export function blockComplete(block: GuideBlock, locale: Locale): boolean {
  const text = (value?: Localized) => !!value?.[locale]?.trim();
  if (block.kind === 'paragraph') return text(block.text);
  if (block.kind === 'list' || block.kind === 'checklist')
    return !!block.items?.length && block.items.every(text);
  if (block.kind === 'figure')
    return (
      !!(block.image?.src || block.image?.asset?._ref) &&
      (!block.image?.src || /^(\/|https:\/\/)/.test(block.image.src)) &&
      text(block.image.alt) &&
      text(block.caption)
    );
  return (
    block.kind === 'table' &&
    !!block.columns?.length &&
    block.columns.every(text) &&
    !!block.rows?.length &&
    block.rows.every((row) => row.cells.length === block.columns!.length && row.cells.every(text))
  );
}
export function sectionComplete(section: Article['sections'][number], locale: Locale) {
  return (
    !!section.heading?.[locale]?.trim() &&
    (!section.tool ||
      ['payload', 'components', 'unloading', 'comparison', 'rfq'].includes(section.tool)) &&
    (section.blocks?.length
      ? section.blocks.every((block) => blockComplete(block, locale))
      : !!section.text?.[locale]?.trim())
  );
}
export function readingMinutes(article: Article, locale: Locale) {
  const strings = [
    article.excerpt[locale],
    ...article.sections.flatMap((section) => [
      section.heading[locale],
      ...(section.blocks?.length
        ? section.blocks.flatMap((b) => [
            b.text?.[locale],
            b.caption?.[locale],
            ...(b.items || []).map((i) => i[locale]),
            ...(b.columns || []).map((i) => i[locale]),
            ...(b.rows || []).flatMap((r) => r.cells.map((c) => c[locale])),
          ])
        : [section.text[locale]]),
    ]),
  ];
  return Math.max(
    1,
    Math.ceil(strings.filter(Boolean).join(' ').trim().split(/\s+/u).length / 200),
  );
}
export function guideContext(articles: Article[], id: string | null, locale: Locale) {
  const article = articles.find((a) => a.id === id && a.published.includes(locale) && !a.sample);
  return article
    ? { guideId: article.id, family: article.categoryId, title: article.title[locale] }
    : undefined;
}
