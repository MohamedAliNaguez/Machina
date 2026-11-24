import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repositoryContent } from '../src/data/repository';
import { validateContent } from '../src/lib/content';

test('all seven LPG source types have bilingual reference galleries and remain unapproved', () => {
  const products = repositoryContent.machines.filter((p) => p.categoryId === 'lpg-catalog');
  assert.deepEqual(
    products.map((p) => p.id).sort(),
    [
      'lpg-semi-trailer',
      'lpg-bobtail',
      'lpg-dispenser-skid-system',
      'lpg-scale-skid-system',
      'lpg-bulk-storage-tank',
      'lpg-domestic-tank',
      'lpg-vaporiser',
    ].sort(),
  );
  assert.equal(
    products.reduce((sum, p) => sum + p.images.length, 0),
    55,
  );
  for (const product of products) {
    assert.equal(product.sample, true);
    assert.equal(product.technicalReview, 'pending');
    assert.ok(
      product.images.every(
        (image) =>
          !image.placeholder && image.rightsStatus === 'pending' && image.alt.en && image.alt.tr,
      ),
    );
  }
  const vaporiser = products.find((p) => p.id === 'lpg-vaporiser')!;
  assert.ok(!vaporiser.specs.some((spec) => spec.label.en === 'Volume'));
  validateContent(repositoryContent, false);
});
