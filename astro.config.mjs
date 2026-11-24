import { defineConfig } from 'astro/config';
import { localEnquiryApi } from './scripts/dev-api.ts';
import { localProduct3D } from './scripts/dev-product-3d.ts';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  base: process.env.PUBLIC_BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  vite: { plugins: [localEnquiryApi(), localProduct3D()], server: { fs: { strict: true } } },
});
