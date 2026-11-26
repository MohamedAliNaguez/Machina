import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repositoryContent } from '../src/data/repository';
import { validateContent } from '../src/lib/content';
import { validateEnquirySetup } from '../src/lib/launch-enquiries';
import {
  productSearchIssues,
  articleSearchIssues,
  searchReleasePages,
  resolveSeoPage,
} from '../src/lib/seo';
import { seoHeadState } from '../src/lib/seo-head';
import { initialGuideDrafts } from '../src/data/seo-editorial';
import type { Content, SeoFields } from '../src/lib/types';
const approved: SeoFields = {
  seoApproval: { en: 'approved', tr: 'approved' },
  seoTitle: { en: 'Test title', tr: 'Test title' },
  seoDescription: { en: 'Test description', tr: 'Test description' },
};
function approvedFixture(): Content {
  const content = structuredClone(repositoryContent);
  content.settings = {
    ...content.settings,
    identityVerified: true,
    privacyReviewed: true,
    manufacturerVerified: true,
    historyApproved: true,
    legalName: 'Fictional test company',
    address: 'Test-only address',
    about: { tr: 'Test', en: 'Test' },
    privacyNotice: { tr: 'Test', en: 'Test' },
    pageSeo: {
      home: structuredClone(approved),
      about: structuredClone(approved),
      contact: structuredClone(approved),
    },
  };
  content.categories.forEach((c) => {
    Object.assign(c, structuredClone(approved));
    c.editorial!.evidence = {
      en: 'Test-only production evidence',
      tr: 'Test-only production evidence',
    };
  });
  return content;
}
const release = { releaseReady: true, preview: false, noindex: false };
test('unverified repository content remains review-only with exactly five families', () => {
  validateContent(repositoryContent, false);
  assert.equal(repositoryContent.machines.length, 14);
  assert.equal(repositoryContent.articles.length, 0);
  assert.equal(searchReleasePages(repositoryContent).filter((p) => !p.issues.length).length, 0);
  assert.throws(
    () => validateContent(repositoryContent, true, { enquiryProvider: 'formspree' }),
    /Launch blocked/,
  );
});
test('sixteen approved company/category pages can launch while all products stay unapproved', () => {
  const content = approvedFixture();
  validateContent(content, true, { enquiryProvider: 'formspree' });
  const ready = searchReleasePages(content).filter((p) => !p.issues.length);
  assert.equal(ready.length, 16);
  assert.ok(ready.every((p) => ['home', 'about', 'contact', 'category'].includes(p.kind)));
  assert.throws(
    () => validateContent(content, true, { enquiryProvider: 'cloudflare' }),
    /challenge/,
  );
});
test('approval and completeness are independent per language; alternates are reciprocal', () => {
  const content = approvedFixture();
  content.settings.pageSeo!.home!.seoApproval!.tr = 'pending';
  const en = seoHeadState(content, '/en/', '/tr/', release);
  const tr = seoHeadState(content, '/tr/', '/en/', release);
  assert.equal(en.indexing, true);
  assert.equal(en.approvedAlternate, undefined);
  assert.equal(en.englishDefault, '/en/');
  assert.equal(tr.indexing, false);
  assert.equal(tr.approvedAlternate, undefined);
  content.settings.pageSeo!.home!.seoApproval!.tr = 'approved';
  assert.equal(seoHeadState(content, '/en/', '/tr/', release).approvedAlternate, '/tr/');
  assert.equal(seoHeadState(content, '/tr/', '/en/', release).approvedAlternate, '/en/');
  content.settings.privacyNotice!.tr = '';
  assert.equal(seoHeadState(content, '/tr/', '/en/', release).indexing, false);
  assert.equal(seoHeadState(content, '/en/', '/tr/', release).indexing, true);
});
test('catalogue, filters, empty guides, brands, design and preview pages never become indexable', () => {
  const content = approvedFixture();
  for (const path of [
    '/en/products/',
    '/tr/urunler/',
    '/en/products/?category=silos',
    '/en/guides/',
    '/en/brands/',
    '/design/loaders/',
  ])
    assert.equal(seoHeadState(content, path, undefined, release).indexing, false, path);
  assert.equal(
    seoHeadState(content, '/en/', '/tr/', { ...release, preview: true }).indexing,
    false,
  );
  assert.equal(
    seoHeadState(content, '/en/', '/tr/', { ...release, releaseReady: false }).indexing,
    false,
  );
});
test('category approval cannot bypass missing production evidence or untranslated copy', () => {
  const content = approvedFixture();
  const c = content.categories[0];
  c.editorial!.evidence!.en = '';
  assert.ok(
    resolveSeoPage(content, `/en/categories/${c.slug.en}/`).issues.some((i) =>
      i.includes('evidence'),
    ),
  );
  c.editorial!.evidence!.en = 'Test-only evidence';
  c.editorial!.sections[0].text.en = '';
  assert.ok(
    resolveSeoPage(content, `/en/categories/${c.slug.en}/`).issues.some((i) =>
      i.includes('explanation'),
    ),
  );
});
test('one genuine approved photograph and one complete language suffice for an individual product', () => {
  const content = approvedFixture();
  const p = content.machines[0];
  Object.assign(p, structuredClone(approved));
  p.sample = false;
  p.technicalReview = 'approved';
  p.published = ['en'];
  p.name.tr = '';
  p.summary.tr = '';
  p.description.tr = '';
  p.images = [
    { ...p.images[0], illustrative: false, placeholder: false, rightsStatus: 'approved' },
  ];
  assert.deepEqual(productSearchIssues(p, 'en'), []);
  validateContent(content, true, { enquiryProvider: 'formspree' });
  assert.ok(productSearchIssues(p, 'tr').includes('Publish this translation'));
  p.images[0].illustrative = true;
  assert.ok(productSearchIssues(p, 'en').some((i) => i.includes('genuine photograph')));
});
test('guide eligibility requires genuine authorship, review, publication dates and sources', () => {
  const a = structuredClone(initialGuideDrafts[0]);
  Object.assign(a, structuredClone(approved));
  assert.ok(articleSearchIssues(a, 'en').length > 0);
  a.imageAlt = { en: 'Test photo', tr: 'Test photo' };
  a.sample = false;
  a.author = 'Test author';
  a.reviewer = 'Test reviewer';
  a.publishedAt = '2025-01-01T00:00:00Z';
  a.reviewedAt = '2025-01-02T00:00:00Z';
  a.sources = [{ title: 'Test reference', url: 'https://example.com/reference' }];
  assert.deepEqual(articleSearchIssues(a, 'en'), []);
  a.reviewedAt = '2024-12-31T00:00:00Z';
  assert.deepEqual(
    articleSearchIssues(a, 'en'),
    [],
    'A technical review may legitimately precede first publication',
  );
  a.reviewedAt = '2099-01-01';
  assert.ok(articleSearchIssues(a, 'en').length > 0);
});
test('five private editorial drafts cover the five families without fabricated reviewers or dates', () => {
  assert.equal(initialGuideDrafts.length, 5);
  assert.equal(new Set(initialGuideDrafts.map((g) => g.categoryId)).size, 5);
  for (const g of initialGuideDrafts) {
    assert.equal(g.sample, true);
    assert.equal(g.author, undefined);
    assert.equal(g.reviewer, undefined);
    assert.equal(g.publishedAt, undefined);
    assert.equal(g.seoApproval!.en, 'pending');
  }
});
test('static hosting requires an endpoint and unsupported hosting is rejected', () => {
  assert.equal(validateEnquirySetup({ hosting: 'github-pages', formId: 'test1234' }), 'formspree');
  assert.throws(() => validateEnquirySetup({ hosting: 'github-pages', formId: '' }), /Formspree/);
  assert.throws(() => validateEnquirySetup({ hosting: 'local' }), /production hosting/);
});

test('brand-only release indexes exactly Home and Contact without certifying missing company facts', () => {
  const content = structuredClone(repositoryContent);
  content.settings.searchReleaseMode = 'brand-only';
  content.settings.pageSeo = {
    home: structuredClone(approved),
    contact: structuredClone(approved),
    about: structuredClone(approved),
  };
  content.settings.identityVerified = false;
  content.settings.manufacturerVerified = false;
  content.settings.privacyReviewed = false;
  content.settings.legalName = '';
  content.settings.address = '';
  content.categories.forEach((c) => Object.assign(c, structuredClone(approved)));
  validateContent(content, true, { enquiryProvider: 'formspree' });
  assert.deepEqual(
    searchReleasePages(content)
      .filter((p) => !p.issues.length)
      .map((p) => p.path)
      .sort(),
    ['/en/', '/en/contact/', '/tr/', '/tr/iletisim/'].sort(),
  );
  assert.equal(seoHeadState(content, '/en/', '/tr/', release).indexing, true);
  assert.equal(seoHeadState(content, '/en/about/', '/tr/hakkimizda/', release).indexing, false);
  assert.equal(
    seoHeadState(content, '/en/', '/tr/', { ...release, preview: true }).indexing,
    false,
  );
  content.settings.manufacturerVerified = true;
  assert.throws(
    () => validateContent(content, true, { enquiryProvider: 'formspree' }),
    /manufacturing positioning/,
  );
  content.settings.manufacturerVerified = false;
  content.settings.email = '';
  assert.equal(seoHeadState(content, '/en/', '/tr/', release).indexing, false);
});
