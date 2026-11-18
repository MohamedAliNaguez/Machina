import delivery from '../data/enquiry-delivery.json';

const env = import.meta.env ?? {};
const id = env.PUBLIC_FORMSPREE_FORM_ID ?? delivery.formspreeFormId;
if (id && !/^[a-z0-9]{6,32}$/.test(id)) throw new Error('Invalid Formspree form ID.');

// Draft-editor previews must not submit real sales enquiries.
export const hostedEnquiryEndpoint =
  env.PUBLIC_HOSTING === 'github-pages' && env.SANITY_PREVIEW !== 'true' && id
    ? `https://formspree.io/f/${id}`
    : undefined;
