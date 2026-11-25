import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialGuideDrafts } from '../src/data/seo-editorial';
import { blockComplete, sectionComplete, readingMinutes, guideContext } from '../src/lib/guides';
test('rich blocks require complete translations, meaningful figures and rectangular tables', () => {
  const bi = { en: 'Complete', tr: 'Tamam' };
  assert.equal(
    blockComplete({ kind: 'table', columns: [bi, bi], rows: [{ cells: [bi] }] }, 'en'),
    false,
  );
  assert.equal(
    blockComplete({ kind: 'figure', image: { src: 'javascript:bad', alt: bi }, caption: bi }, 'en'),
    false,
  );
  assert.equal(blockComplete({ kind: 'checklist', items: [{ en: 'Ready', tr: '' }] }, 'tr'), false);
  assert.equal(
    sectionComplete(
      { heading: bi, text: { en: '', tr: '' }, blocks: [{ kind: 'paragraph', text: bi }] },
      'en',
    ),
    true,
  );
});
test('five practical bilingual drafts retain private review state and contain useful tables and checklists', () => {
  assert.equal(initialGuideDrafts.length, 5);
  for (const article of initialGuideDrafts) {
    assert.equal(article.sample, true);
    assert.ok(!article.author && !article.reviewer && !article.publishedAt);
    for (const locale of ['en', 'tr'] as const) {
      assert.ok(article.sections.every((s) => sectionComplete(s, locale)));
      assert.ok(readingMinutes(article, locale) >= 1);
    }
    assert.ok(article.sections.some((s) => s.blocks?.some((b) => b.kind === 'table')));
    assert.ok(article.sections.some((s) => s.blocks?.some((b) => b.kind === 'checklist')));
    assert.equal(guideContext([article], article.id, 'en'), undefined);
  }
  const published = { ...initialGuideDrafts[0], sample: false };
  assert.equal(guideContext([published], published.id, 'en')?.family, 'cement-bulker');
  assert.equal(guideContext([published], 'visitor-injected-id', 'en'), undefined);
});
