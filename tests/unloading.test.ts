import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cementUnloadingGuide } from '../src/data/cement-unloading';
import { sectionComplete } from '../src/lib/guides';
import { estimateFleet, estimateUnloading } from '../src/lib/procurement';

test('supplied unloading manuscript preserves all 13 sections, conclusion, figures, tables and eight FAQs', () => {
  const article = cementUnloadingGuide();
  assert.equal(article.sections.length, 14);
  assert.ok(article.sections.every((section) => sectionComplete(section, 'en')));
  const blocks = article.sections.flatMap((section) => section.blocks!);
  assert.equal(blocks.filter((block) => block.kind === 'figure').length, 3);
  assert.equal(blocks.filter((block) => block.kind === 'table').length, 9);
  assert.equal(article.sections[12].blocks!.filter((block) => block.kind === 'heading').length, 8);
  assert.ok(
    JSON.stringify(article).includes('Included mounting hardware and auxiliary equipment.'),
  );
  assert.ok(JSON.stringify(article).includes('site-specific safety assessments.'));
  assert.equal(article.sections[4].tool, 'unloading');
  assert.equal(article.sections[7].tool, 'fleet');
  assert.deepEqual(article.published, ['en']);
  assert.equal(article.seoApproval?.en, 'pending');
  assert.equal(article.author, undefined);
  assert.equal(article.reviewer, undefined);
  assert.equal(article.reviewedAt, undefined);
});

test('turnaround and fleet examples match the manuscript and distinguish value from recoverable benefit', () => {
  assert.deepEqual(
    [25, 40, 60, 80].map((rate) => estimateUnloading(25, rate, 15)),
    [75, 52.5, 40, 33.75],
  );
  const assumptions = {
    vehicles: 5,
    deliveries: 300,
    current: 75,
    target: 45,
    hourly: 35,
    recoverable: 50,
    investment: 4000,
  };
  const result = estimateFleet(assumptions)!;
  assert.equal(result.hours, 750);
  assert.equal(result.timeValue, 26250);
  assert.equal(result.annualBenefit, 13125);
  assert.equal(result.totalInvestment, 20000);
  assert.ok(Math.abs(result.payback! - 18.2857142857) < 1e-8);
  assert.equal(estimateFleet({ ...assumptions, recoverable: 0 })?.payback, undefined);
  assert.equal(estimateFleet({ ...assumptions, target: 75 })?.hours, 0);
  for (const patch of [
    { vehicles: 1.5 },
    { deliveries: 0 },
    { target: 80 },
    { hourly: -1 },
    { recoverable: 101 },
    { investment: Infinity },
    { current: NaN },
  ]) {
    assert.equal(estimateFleet({ ...assumptions, ...patch }), undefined);
  }
});
