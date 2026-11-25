import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measurementPayload } from '../src/lib/measurement';
import { productImageUrl } from '../src/lib/image-delivery';
test('measurement only emits approved dimensions and drops query strings and arbitrary families', () => {
  assert.deepEqual(
    measurementPayload('en', '/en/contact/?email=private@example.com#message', 'lpg-catalog'),
    { language: 'en', page_path: '/en/contact/', product_family: 'lpg-catalog' },
  );
  assert.deepEqual(measurementPayload('invalid', '/en/', 'private@example.com'), {
    language: 'en',
    page_path: '/en/',
  });
});
test('responsive delivery keeps originals intact and only transforms Sanity images', () => {
  const source = 'https://cdn.sanity.io/images/project/production/test-1500x1000.png';
  const resized = new URL(productImageUrl(source, 640));
  assert.equal(resized.pathname, new URL(source).pathname);
  assert.equal(resized.searchParams.get('w'), '640');
  assert.equal(productImageUrl('/images/original.webp', 640), '/images/original.webp');
});
