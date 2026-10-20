import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleContent } from '../src/data/sample';
import { validateContent } from '../src/lib/content';
import { url, otherLocale } from '../src/lib/i18n';

test('sample catalogue is bilingual, navigable and explicitly unverified', () => {
  validateContent(sampleContent, false);
  assert.equal(sampleContent.machines.length, 12);
  assert.equal(sampleContent.machines.filter((m) => m.kind === 'new').length, 6);
  assert.ok(sampleContent.machines.every((m) => m.sample && m.images.every((i) => i.illustrative)));
  assert.equal(sampleContent.settings.identityVerified, false);
});
test('live build rejects sample data and unverified company identity', () => {
  assert.throws(() => validateContent(sampleContent, true), /Launch blocked/);
});
test('missing used-machine facts and missing translations fail validation', () => {
  const missingHours = structuredClone(sampleContent);
  delete missingHours.machines.find((m) => m.kind === 'used')!.hours;
  assert.throws(() => validateContent(missingHours, false), /used-machine facts/);
  const missingTranslation = structuredClone(sampleContent);
  missingTranslation.machines[0].summary.en = '';
  assert.throws(() => validateContent(missingTranslation, false), /translation/);
});
test('duplicate routes and unsafe media URLs are rejected', () => {
  const duplicate = structuredClone(sampleContent);
  duplicate.machines[1].slug.en = duplicate.machines[0].slug.en;
  assert.throws(() => validateContent(duplicate, false), /Duplicate/);
  const invalid = structuredClone(sampleContent);
  invalid.machines[0].images[0].src = 'javascript:invalid';
  assert.throws(() => validateContent(invalid, false), /Invalid media/);
});
test('locale paths map matching content to its translated route', () => {
  assert.equal(url('tr', 'machines', 'ex210'), '/tr/makineler/ex210/');
  assert.equal(url('en', 'categories', 'excavators'), '/en/categories/excavators/');
  assert.equal(otherLocale('tr'), 'en');
});
