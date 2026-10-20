export type ErrorCode = 'required' | 'contact' | 'invalid' | 'length';
export interface EnquiryInput {
  name: string;
  email: string;
  phone: string;
  message: string;
  language: 'en' | 'tr';
  machineId: string;
}
export function validateEnquiry(
  input: Record<string, unknown>,
): { ok: true; value: EnquiryInput } | { ok: false; errors: Record<string, ErrorCode> } {
  const str = (key: string) =>
    typeof input[key] === 'string' ? (input[key] as string).trim() : '';
  const value = {
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    message: str('message'),
    language: str('language') as 'en' | 'tr',
    machineId: str('machineId'),
  };
  const errors: Record<string, ErrorCode> = {};
  if (value.name.length < 2 || value.name.length > 120) errors.name = 'required';
  if (!value.email && !value.phone) {
    errors.email = 'contact';
    errors.phone = 'contact';
  }
  if (value.email && (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)))
    errors.email = 'invalid';
  if (
    value.phone &&
    (!/^[+\d\s().-]{7,40}$/.test(value.phone) || value.phone.replace(/\D/g, '').length < 7)
  )
    errors.phone = 'invalid';
  if (value.message.length < 10 || value.message.length > 4000) errors.message = 'length';
  if (!['en', 'tr'].includes(value.language)) errors.language = 'invalid';
  if (value.machineId && !/^[a-zA-Z0-9_-]{1,100}$/.test(value.machineId))
    errors.machineId = 'invalid';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
