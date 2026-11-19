import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnquiry } from '../src/lib/enquiry-validation';

const enquiry = {
  name: 'Example buyer',
  email: '',
  message: 'Please send the product configuration details.',
  language: 'en',
};

test('country selection produces full international numbers and handles national trunk prefixes', () => {
  for (const [phoneCountry, phone, expected] of [
    ['TR', '0532 712 24 17', '+905327122417'],
    ['TR', '532 712 24 17', '+905327122417'],
    ['TR', '+90 532 712 24 17', '+905327122417'],
    ['TR', '0044 20 7946 0958', '+442079460958'],
    ['GB', '020 7946 0958', '+442079460958'],
    ['IT', '02 36618 300', '+390236618300'],
    ['US', '(202) 555-0123', '+12025550123'],
    ['CA', '(416) 555-0123', '+14165550123'],
  ]) {
    const result = validateEnquiry({ ...enquiry, phoneCountry, phone });
    assert.equal(result.ok, true, `${phoneCountry}: ${phone}`);
    if (result.ok) assert.equal(result.value.phone, expected);
  }
});

test('selecting a code alone is not contact information, and invalid numbers are rejected', () => {
  assert.equal(validateEnquiry({ ...enquiry, phoneCountry: 'TR', phone: '' }).ok, false);
  const emailOnly = validateEnquiry({
    ...enquiry,
    email: 'buyer@example.test',
    phoneCountry: 'TR',
    phone: '',
  });
  assert.equal(emailOnly.ok, true);
  if (emailOnly.ok) assert.equal(emailOnly.value.phone, '');
  for (const [phoneCountry, phone] of [
    ['TR', '12'],
    ['TR', '+90'],
    ['TR', 'call 532 712 24 17'],
    ['XX', '5327122417'],
  ]) {
    const result = validateEnquiry({ ...enquiry, phoneCountry, phone });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.errors.phone, 'invalid');
  }
});
