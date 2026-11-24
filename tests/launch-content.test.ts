import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repositoryContent } from '../src/data/repository';
import { validateContent } from '../src/lib/content';
import { validateEnquirySetup } from '../src/lib/launch-enquiries';

function approvedFixture() {
  const content = structuredClone(repositoryContent);
  content.settings = {
    ...content.settings,
    identityVerified: true,
    privacyReviewed: true,
    legalName: 'Test company',
    about: { tr: 'Test', en: 'Test' },
    privacyNotice: { tr: 'Test', en: 'Test' },
  };
  content.machines = [content.machines[0]];
  const product = content.machines[0];
  product.sample = false;
  product.technicalReview = 'approved';
  product.images.forEach((image) => {
    image.illustrative = false;
    image.placeholder = false;
    image.rightsStatus = 'approved';
  });
  return content;
}

test('repository content stays a fourteen-product preview until evidence is approved', () => {
  validateContent(repositoryContent, false);
  assert.equal(repositoryContent.machines.length, 14);
  assert.equal(repositoryContent.articles.length, 0);
  assert.throws(
    () => validateContent(repositoryContent, true, { enquiryProvider: 'formspree' }),
    /Launch blocked/,
  );
});

test('approved repository content supports Formspree without unused Cloudflare challenge settings', () => {
  const content = approvedFixture();
  validateContent(content, true, { enquiryProvider: 'formspree' });
  assert.throws(
    () => validateContent(content, true, { enquiryProvider: 'cloudflare' }),
    /challenge/,
  );
  content.settings.turnstileSiteKey = 'test-key';
  validateContent(content, true, { enquiryProvider: 'cloudflare' });
});

test('launch requires explicit evidence approval, two distinct photos and complete language journeys', () => {
  for (const invalidate of [
    (content: ReturnType<typeof approvedFixture>) => {
      content.machines[0].technicalReview = undefined;
    },
    (content: ReturnType<typeof approvedFixture>) => {
      content.machines[0].images[0].rightsStatus = undefined;
    },
    (content: ReturnType<typeof approvedFixture>) => {
      content.machines[0].images[1].src = content.machines[0].images[0].src;
    },
    (content: ReturnType<typeof approvedFixture>) => {
      content.machines[0].published = ['en'];
    },
  ]) {
    const content = approvedFixture();
    invalidate(content);
    assert.throws(
      () => validateContent(content, true, { enquiryProvider: 'formspree' }),
      /Launch blocked/,
    );
  }
});

test('static hosting requires an endpoint and unsupported production hosting is rejected', () => {
  assert.equal(validateEnquirySetup({ hosting: 'github-pages', formId: 'test1234' }), 'formspree');
  assert.equal(validateEnquirySetup({ hosting: 'cloudflare' }), 'cloudflare');
  assert.throws(() => validateEnquirySetup({ hosting: 'github-pages', formId: '' }), /Formspree/);
  assert.throws(() => validateEnquirySetup({ hosting: 'local' }), /production hosting/);
});
