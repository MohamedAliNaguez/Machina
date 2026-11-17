import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withBase } from '../src/lib/paths';

test('repository hosting prefixes routes, image paths and API URLs without duplicating the base', () => {
  assert.equal(
    withBase('/en/products/?category=compressors', '/Machina/'),
    '/Machina/en/products/?category=compressors',
  );
  assert.equal(
    withBase('/images/products/silos-placeholder.svg', '/Machina'),
    '/Machina/images/products/silos-placeholder.svg',
  );
  assert.equal(withBase('/api/enquiries', '/Machina'), '/Machina/api/enquiries');
  assert.equal(withBase('/Machina/tr/', '/Machina/'), '/Machina/tr/');
  assert.equal(withBase('/en/', '/'), '/en/');
});

test('repository hosting preserves remote media, fragment links and protocol-relative URLs', () => {
  for (const path of [
    'https://cdn.sanity.io/images/example.webp',
    '#specification',
    '//example.com/image.webp',
  ]) {
    assert.equal(withBase(path, '/Machina/'), path);
  }
});
