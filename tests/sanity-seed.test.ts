import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repositoryContent } from '../src/data/repository';
import { prepareSanitySeed } from '../scripts/lib/sanity-seed';

test('CMS migration retains stable routes, review flags, image metadata and five category references', async () => {
  const docs = await prepareSanitySeed(repositoryContent, async () => 'image-test-100x100-webp');
  assert.equal(docs.length, 20);
  assert.equal(docs.filter((doc) => doc._type === 'category').length, 5);
  assert.ok(docs.every((doc) => !doc._id.includes('.')));
  for (const product of repositoryContent.machines) {
    const doc = docs.find((item) => item.id === product.id)!;
    assert.deepEqual(doc.slug, product.slug);
    assert.equal(doc.sample, product.sample);
    assert.equal(doc.technicalReview, product.technicalReview);
    assert.equal(doc.category._ref, `category-${product.categoryId}`);
    assert.equal(doc.images[0].asset._ref, 'image-test-100x100-webp');
    assert.equal(doc.images[0].illustrative, product.images[0].illustrative);
    assert.ok(doc.images[0]._key);
    assert.equal(doc.reference, undefined);
    assert.equal(doc.images[0].src, undefined);
  }
});

test('CMS reimport preserves existing published documents and unpublished drafts without uploading assets', async () => {
  const docs = await prepareSanitySeed(repositoryContent, async () => 'unused');
  const existing = new Set(docs.map((doc, index) => `${index % 2 ? 'drafts.' : ''}${doc._id}`));
  const result = await prepareSanitySeed(
    repositoryContent,
    async () => {
      throw new Error('Unexpected upload');
    },
    existing,
  );
  assert.deepEqual(result, []);
});
