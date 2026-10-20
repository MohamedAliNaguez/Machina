import { retryNotifications, type EnquiryEnv } from '../src/lib/enquiry-server';
export default {
  async scheduled(_event: ScheduledEvent, env: EnquiryEnv, context: ExecutionContext) {
    context.waitUntil(retryNotifications(env));
  },
  async fetch() {
    return new Response('Not found', { status: 404 });
  },
};
