import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

/** Serve only these trial assets locally. Signed Meshy metadata never enters public/. */
export function localProduct3D(): Plugin {
  const folder = resolve('meshy_output/cement-bulker');
  const assets: Record<string, { file: string; type: string }> = {
    '/__product-3d/trial.glb': {
      file: resolve(folder, 'technicsan-cement-bulker.glb'),
      type: 'model/gltf-binary',
    },
    '/__product-3d/reference.png': {
      file: resolve(folder, 'reference-quarter.png'),
      type: 'image/png',
    },
    '/__product-3d/side.png': {
      file: resolve(folder, 'reference-side.png'),
      type: 'image/png',
    },
  };
  return {
    name: 'local-product-3d-trial',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        const asset = assets[pathname];
        if (!asset) return next();
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          response.writeHead(405, { Allow: 'GET, HEAD' }).end();
          return;
        }
        const info = await stat(asset.file).catch(() => undefined);
        if (!info?.isFile()) {
          response.writeHead(404, { 'Cache-Control': 'no-store' }).end('Trial asset not ready');
          return;
        }
        response.writeHead(200, {
          'Content-Type': asset.type,
          'Content-Length': info.size,
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        });
        if (request.method === 'HEAD') response.end();
        else createReadStream(asset.file).pipe(response);
      });
    },
  };
}
