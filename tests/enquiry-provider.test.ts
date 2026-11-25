import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveEnquiryProvider } from '../src/lib/enquiry-provider';
import { validateEnquirySetup } from '../src/lib/launch-enquiries';

test('Cloudflare can preserve the existing Formspree inbox without a D1/challenge migration', () => {
  assert.equal(
    resolveEnquiryProvider({ hosting: 'cloudflare', provider: 'formspree' }),
    'formspree',
  );
  assert.equal(
    validateEnquirySetup({ hosting: 'cloudflare', provider: 'formspree', formId: 'test1234' }),
    'formspree',
  );
  assert.throws(
    () => validateEnquirySetup({ hosting: 'cloudflare', provider: 'formspree', formId: '' }),
    /Formspree/,
  );
});
test('local, GitHub and explicitly native Cloudflare delivery keep their established defaults', () => {
  assert.equal(resolveEnquiryProvider({ hosting: 'local' }), 'local');
  assert.equal(resolveEnquiryProvider({ hosting: 'github-pages' }), 'formspree');
  assert.equal(resolveEnquiryProvider({ hosting: 'cloudflare' }), 'cloudflare');
  assert.throws(
    () => resolveEnquiryProvider({ hosting: 'local', provider: 'formspree' }),
    /incompatible/,
  );
  assert.throws(
    () => resolveEnquiryProvider({ hosting: 'github-pages', provider: 'cloudflare' }),
    /incompatible/,
  );
});
