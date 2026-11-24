/** Validate the selected production delivery path without sending a test enquiry. */
export function validateEnquirySetup(config: { hosting: string; formId?: string }) {
  if (config.hosting === 'github-pages') {
    if (!config.formId || !/^[a-z0-9]{6,32}$/.test(config.formId))
      throw new Error('Launch blocked: a valid Formspree form ID is required for static hosting.');
    return 'formspree' as const;
  }
  if (config.hosting !== 'cloudflare')
    throw new Error('Launch blocked: choose github-pages or cloudflare production hosting.');
  return 'cloudflare' as const;
}
