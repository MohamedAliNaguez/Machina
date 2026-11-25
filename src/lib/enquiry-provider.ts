export type EnquiryProvider = 'local' | 'formspree' | 'cloudflare';

/** Hosting and mail delivery are independent; a hosting move must not change the sales inbox. */
export function resolveEnquiryProvider(config: {
  hosting: string;
  provider?: string;
}): EnquiryProvider {
  const { hosting } = config;
  const provider =
    config.provider ||
    (hosting === 'github-pages' ? 'formspree' : hosting === 'cloudflare' ? 'cloudflare' : 'local');
  if (!['', 'local', 'github-pages', 'cloudflare'].includes(hosting))
    throw new Error('Unknown hosting provider.');
  if ((hosting === '' || hosting === 'local') && provider === 'local') return 'local';
  if (['github-pages', 'cloudflare'].includes(hosting) && provider === 'formspree')
    return 'formspree';
  if (hosting === 'cloudflare' && provider === 'cloudflare') return 'cloudflare';
  throw new Error('The enquiry provider is incompatible with the hosting environment.');
}
