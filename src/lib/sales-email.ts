import delivery from '../data/enquiry-delivery.json';
import { resolveEnquiryProvider } from './enquiry-provider';

const env = import.meta.env ?? {};
const id = env.PUBLIC_FORMSPREE_FORM_ID ?? delivery.formspreeFormId;
export const enquiryProvider = resolveEnquiryProvider({
  hosting: env.PUBLIC_HOSTING || 'local',
  provider: env.PUBLIC_ENQUIRY_PROVIDER,
});
if (id && !/^[a-z0-9]{6,32}$/.test(id)) throw new Error('Invalid Formspree form ID.');

// Draft-editor previews must not submit real sales enquiries.
export const hostedEnquiryEndpoint =
  enquiryProvider === 'formspree' && env.SANITY_PREVIEW !== 'true' && id
    ? `https://formspree.io/f/${id}`
    : undefined;
