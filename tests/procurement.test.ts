import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimatePayload, estimateUnloading, buildRfq } from '../src/lib/procurement';
test('payload screening distinguishes volume and gross weight and rejects impossible assumptions', () => {
  const inputs = { volume: 35, density: 1.2, fill: 90, tractor: 8, trailer: 6.5, gross: 40 };
  const result = estimatePayload(inputs)!;
  assert.ok(Math.abs(result.volumeMass - 37.8) < 1e-9);
  assert.equal(result.weightMass, 25.5);
  assert.equal(result.ceiling, 25.5);
  assert.equal(result.limiting, 'weight');
  assert.equal(estimatePayload({ ...inputs, density: 0.5 })?.limiting, 'volume');
  for (const patch of [
    { fill: 101 },
    { fill: 0 },
    { density: -1 },
    { gross: 14.5 },
    { volume: Infinity },
    { trailer: NaN },
  ])
    assert.equal(estimatePayload({ ...inputs, ...patch }), undefined);
});
test('unloading arithmetic remains an assumed rate calculation and rejects invalid inputs', () => {
  assert.equal(estimateUnloading(25.5, 30, 10), 61);
  assert.equal(estimateUnloading(10, 20, 0), 30);
  assert.equal(estimateUnloading(10, 0, 5), undefined);
  assert.equal(estimateUnloading(10, 20, -1), undefined);
  assert.equal(estimateUnloading(NaN, 20, 5), undefined);
});
test('RFQ briefs preserve unknowns, bound input lengths and localise the actual message', () => {
  const en = buildRfq({ material: 'Portland cement', destination: 'Kenya' }, false);
  assert.ok(en.includes('Material and bulk density: Portland cement'));
  assert.ok(en.includes('Tractor details: To confirm'));
  assert.ok(
    buildRfq({ destination: 'Türkiye' }, true).includes('Hedef ülke / teslim yeri: Türkiye'),
  );
  assert.ok(buildRfq({ material: 'x'.repeat(10000) }, false).length < 4000);
});
import { validateContent } from '../src/lib/content';
import { repositoryContent } from '../src/data/repository';
import { initialGuideDrafts } from '../src/data/seo-editorial';
test('duplicate interactive forms and tools cannot be published in one guide', () => {
  const article = structuredClone(initialGuideDrafts[0]);
  article.sections[0].tool = 'rfq';
  article.sections[1].tool = 'rfq';
  assert.throws(
    () => validateContent({ ...repositoryContent, articles: [article] }, false),
    /Duplicate interactive tool/,
  );
});
