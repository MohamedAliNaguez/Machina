import type { Content } from './types';
import { resolveSeoPage } from './seo';

export function seoHeadState(
  content: Content,
  pathname: string,
  alternate: string | undefined,
  flags: { releaseReady: boolean; preview: boolean; noindex: boolean },
) {
  const page = resolveSeoPage(content, pathname);
  const indexing = flags.releaseReady && !flags.preview && !flags.noindex && !page.issues.length;
  const approvedAlternate =
    indexing && alternate && !resolveSeoPage(content, alternate).issues.length
      ? alternate
      : undefined;
  return {
    page,
    indexing,
    approvedAlternate,
    englishDefault: indexing ? (page.locale === 'en' ? pathname : approvedAlternate) : undefined,
  };
}
