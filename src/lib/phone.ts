import {
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/min';

export function parseInternationalPhone(value: string, country: string) {
  if (!isSupportedCountry(country) || !/^[+\d\s().-]+$/.test(value)) return undefined;
  const phone = parsePhoneNumberFromString(value.trim().replace(/^00/, '+'), {
    defaultCountry: country as CountryCode,
    extract: false,
  });
  return phone?.isPossible() ? phone : undefined;
}
