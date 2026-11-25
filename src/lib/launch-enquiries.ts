import { resolveEnquiryProvider } from './enquiry-provider';
/** Validate the selected production delivery path without sending a test enquiry. */
export function validateEnquirySetup(config: {
  hosting: string;
  provider?: string;
  formId?: string;
}) {
  if (!['github-pages', 'cloudflare'].includes(config.hosting))
    throw new Error('Launch blocked: choose github-pages or cloudflare production hosting.');
  const provider = resolveEnquiryProvider(config);
  if (provider === 'formspree') {
    if (!config.formId || !/^[a-z0-9]{6,32}$/.test(config.formId))
      throw new Error('Launch blocked: a valid Formspree form ID is required for static hosting.');
    return 'formspree' as const;
  }
  return 'cloudflare' as const;
}
