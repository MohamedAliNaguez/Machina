import { productSearchIssues } from '../src/lib/seo-policy';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleContent } from '../src/data/sample';
import { validateContent } from '../src/lib/content';
import { url, otherLocale } from '../src/lib/i18n';

test('sample catalogue is bilingual, navigable and explicitly unverified', () => {
  validateContent(sampleContent, false);
  assert.equal(sampleContent.machines.length, 14);
  assert.deepEqual(
    sampleContent.categories.map((category) => category.name.en),
    ['Cement bulker', 'LPG catalog', 'Compressors', 'Mixers', 'Silos'],
  );
  assert.ok(
    sampleContent.machines.every(
      (product) => product.specs.length > 0 && product.technicalReview === 'pending',
    ),
  );
  assert.ok(
    sampleContent.machines.every(
      (m) =>
        m.sample &&
        m.images.every(
          (i) =>
            !i.sourceUrl &&
            !i.credit &&
            (i.rightsStatus === 'pending' ||
              (m.id === 'v-type-silobas' &&
                i.src.startsWith('/images/products/technicsan/') &&
                i.rightsStatus === 'approved' &&
                i.illustrative)),
        ),
    ),
  );
  assert.equal(sampleContent.settings.identityVerified, false);
});
test('live build rejects sample data and unverified company identity', () => {
  assert.throws(() => validateContent(sampleContent, true), /Launch blocked/);
});
test('missing used-machine facts and missing translations fail validation', () => {
  const missingHours = structuredClone(sampleContent);
  missingHours.machines[0].kind = 'used';
  missingHours.machines[0].year = 2021;
  missingHours.machines[0].condition = { tr: 'Kontrol bekleniyor', en: 'Inspection pending' };
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
  assert.equal(url('tr', 'machines', 'kompresorler'), '/tr/urunler/kompresorler/');
  assert.equal(url('en', 'categories', 'compressors'), '/en/categories/compressors/');
  assert.equal(otherLocale('tr'), 'en');
});

test('catalogue rejects an additional product type and published models without verified specifications', () => {
  const extraType = structuredClone(sampleContent);
  extraType.categories.push({ ...extraType.categories[0], id: 'excavators' });
  assert.throws(() => validateContent(extraType, false), /five approved/);
  const unverified = structuredClone(sampleContent);
  unverified.machines[0].sample = false;
  unverified.machines[0].specs = [];
  assert.throws(() => validateContent(unverified, false), /Incomplete machine/);
});

test('reference catalogue preserves all five families and treats missing source media honestly', () => {
  assert.deepEqual(
    Object.fromEntries(
      sampleContent.categories.map((category) => [
        category.id,
        sampleContent.machines.filter((product) => product.categoryId === category.id).length,
      ]),
    ),
    {
      'cement-bulker': 1,
      'lpg-catalog': 7,
      compressors: 2,
      mixers: 2,
      silos: 2,
    },
  );
  assert.equal(
    sampleContent.machines.flatMap((product) => product.images).filter((image) => image.placeholder)
      .length,
    5,
  );
  assert.ok(
    !sampleContent.machines.some((product) => /^lpg-part-(?:8|62|63|64|93|94)$/.test(product.id)),
  );
  assert.equal(sampleContent.machines.filter((product) => product.specificationTable).length, 1);
  assert.equal(
    sampleContent.machines.find((product) => product.id === 'wet-system')?.specificationTable
      ?.columns.length,
    4,
  );
});

test('source attribution, table shape and pending publication approvals are enforced', () => {
  const unsafe = structuredClone(sampleContent);
  unsafe.machines[0].reference = {
    publisher: 'Test source',
    url: 'javascript:alert(1)',
    retrievedAt: '2026-11-17',
    reviewStatus: 'pending',
  };
  assert.throws(() => validateContent(unsafe, false), /Invalid product reference/);
  const invalidTable = structuredClone(sampleContent);
  invalidTable.machines
    .find((product) => product.specificationTable)!
    .specificationTable!.rows[0].values.pop();
  assert.throws(() => validateContent(invalidTable, false), /Invalid specification table/);
  const pending = structuredClone(sampleContent);
  pending.settings = {
    ...pending.settings,
    identityVerified: true,
    privacyReviewed: true,
    legalName: 'Test Company',
    email: 'test@example.test',
    about: { tr: 'Test', en: 'Test' },
    privacyNotice: { tr: 'Test', en: 'Test' },
    turnstileSiteKey: 'test',
  };
  pending.machines = [pending.machines.find((product) => product.id === 'lpg-semi-trailer')!];
  pending.machines[0].sample = false;
  pending.machines[0].images.forEach((image) => {
    image.illustrative = false;
    image.placeholder = false;
  });
  assert.ok(
    productSearchIssues(pending.machines[0], 'en').some((issue) =>
      issue.includes('technical information'),
    ),
  );
});

test('public catalogue contains no supplier names, external brochures or private source metadata', () => {
  const banned = /tedsan|confidence|ünal|unal-|nt[ -]?makin|gaslin|tricon|blackmer/i;
  assert.doesNotMatch(JSON.stringify(sampleContent.machines), banned);
  assert.ok(
    sampleContent.machines.every(
      (product) => !product.reference && !product.brochure && !product.brandId,
    ),
  );
  assert.ok(sampleContent.machines.every((product) => product.images.length > 0));
  assert.ok(
    sampleContent.machines
      .flatMap((product) => product.images)
      .every(
        (image) =>
          image.src.startsWith('/images/products/catalogue/') ||
          image.src.startsWith('/images/products/technicsan/') ||
          image.src.startsWith('/images/products/lpg/') ||
          image.placeholder,
      ),
  );
});
