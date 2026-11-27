import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planSilo } from '../src/lib/silo-planner';
import { siloCapacityGuide } from '../src/data/silo-capacity';
import { sectionComplete } from '../src/lib/guides';
import { toolSupportsCategory } from '../src/lib/procurement';
const example = {
  production: 100,
  dosage: 320,
  lead: 1,
  reserve: 0.5,
  delivery: 28,
  density: 1.2,
  fill: 90,
  unavailable: 4,
  volume: 80,
};
test('silo planner matches the supplied consumption, reserve, receiving and volume examples', () => {
  const plan = planSilo(example)!;
  assert.equal(plan.daily, 32);
  assert.equal(plan.safety, 16);
  assert.equal(plan.reorder, 48);
  assert.equal(plan.target, 76);
  assert.ok(Math.abs(plan.requiredVolume - 74.074074) < 1e-6);
  assert.ok(Math.abs(plan.usable - 82.4) < 1e-10);
  assert.ok(Math.abs(plan.autonomy - 2.575) < 1e-10);
  assert.ok(Math.abs(plan.deliveries - 32 / 28) < 1e-10);
  assert.ok(Math.abs(plan.margin - 6.4) < 1e-10);
  assert.ok(planSilo({ ...example, volume: 60 })!.margin < 0);
  assert.equal(planSilo({ ...example, lead: 0, reserve: 0 })?.target, 28);
  for (const patch of [
    { production: 0 },
    { dosage: NaN },
    { density: 0 },
    { fill: 101 },
    { fill: 0 },
    { reserve: -1 },
    { lead: -1 },
    { delivery: 0 },
    { unavailable: 100 },
    { volume: Infinity },
    { production: Number.MAX_VALUE },
  ])
    assert.equal(planSilo({ ...example, ...patch }), undefined);
});
test('density sensitivity uses all five supplied scenarios without treating tonnage as a structural rating', () => {
  const values = [1, 1.1, 1.2, 1.3, 1.4].map(
    (density) => Math.round(planSilo({ ...example, density })!.usable * 10) / 10,
  );
  assert.deepEqual(values, [68, 75.2, 82.4, 89.6, 96.8]);
  assert.equal(toolSupportsCategory('silo', 'silos'), true);
  assert.equal(toolSupportsCategory('silo', 'cement-bulker'), false);
  assert.equal(toolSupportsCategory('rfq', 'silos'), false);
});
test('complete silo manuscript retains 17 numbered sections, conclusion, three figures, nine tables and nine FAQs', () => {
  const article = siloCapacityGuide();
  const blocks = article.sections.flatMap((section) => section.blocks!);
  assert.equal(article.sections.length, 18);
  assert.ok(article.sections.every((section) => sectionComplete(section, 'en')));
  assert.equal(blocks.filter((block) => block.kind === 'figure').length, 3);
  assert.equal(blocks.filter((block) => block.kind === 'table').length, 9);
  assert.equal(article.sections[16].blocks?.filter((block) => block.kind === 'heading').length, 9);
  assert.equal(article.sections[5].tool, 'silo');
  assert.ok(
    JSON.stringify(article).includes(
      'Request manufacturer performance data for the proposed installation geometry.',
    ),
  );
  assert.ok(JSON.stringify(article).includes('site-specific safety assessments.'));
  assert.deepEqual(article.published, ['en']);
  assert.equal(article.seoApproval?.en, 'pending');
  assert.equal(article.author, undefined);
  assert.equal(article.reviewedAt, undefined);
});
