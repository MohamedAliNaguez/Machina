import { handleEnquiry, type EnquiryEnv } from '../../src/lib/enquiry-server';
export const onRequest: PagesFunction<EnquiryEnv> = (context) =>
  handleEnquiry(context.request, context.env, (promise) => context.waitUntil(promise));
