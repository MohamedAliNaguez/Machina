import { mkdirSync } from 'node:fs';
import type { Plugin } from 'vite';
import { createLocalDatabase } from './sqlite-adapter';
import { handleEnquiry } from '../src/lib/enquiry-server';
export function localEnquiryApi(): Plugin {
  return {
    name: 'local-enquiry-api',
    apply: 'serve',
    configureServer(server) {
      mkdirSync('.local', { recursive: true });
      const { db, close } = createLocalDatabase('.local/enquiries.sqlite');
      server.httpServer?.once('close', close);
      server.middlewares.use('/api/enquiries', async (req, res) => {
        const chunks: Buffer[] = [];
        let length = 0;
        for await (const chunk of req) {
          length += chunk.length;
          if (length > 16000) {
            res.writeHead(413);
            res.end();
            return;
          }
          chunks.push(Buffer.from(chunk));
        }
        const origin = `http://${req.headers.host}`;
        const request = new Request(`${origin}/api/enquiries`, {
          method: req.method,
          headers: req.headers as Record<string, string>,
          ...(req.method !== 'GET' && req.method !== 'HEAD'
            ? { body: Buffer.concat(chunks).toString() }
            : {}),
        });
        const response = await handleEnquiry(
          request,
          { DB: db, ENVIRONMENT: 'preview', SITE_ORIGIN: origin },
          (promise) => {
            void promise;
          },
        );
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(await response.text());
      });
    },
  };
}
