import { readdirSync, readFileSync, existsSync } from 'node:fs';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fastifyStatic from '@fastify/static';
import { StoreProvider } from '@wsh-2025/client/src/app/StoreContext';
import { createRoutes } from '@wsh-2025/client/src/app/createRoutes';
import { createStore } from '@wsh-2025/client/src/app/createStore';
import type { FastifyInstance } from 'fastify';
import { createStandardRequest } from 'fastify-standard-request-reply';
import htmlescape from 'htmlescape';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import dedent from 'dedent';

function getFiles(parent: string): string[] {
  const dirents = readdirSync(parent, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isFile() && !dirent.name.startsWith('.'))
    .map((dirent) => path.join(parent, dirent.name));
}

function getFilePaths(relativePath: string, rootDir: string): string[] {
  const files = getFiles(path.resolve(rootDir, relativePath));
  return files.map((file) => path.join('/', path.relative(rootDir, file)));
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.wasm': 'application/wasm',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

export function registerSsr(app: FastifyInstance): void {
  app.get('/public/*', async (request, reply) => {
    const candidates = [
      path.join(__dirname, '../../client/dist', (request.params as Record<string, string>)['*']!),
      path.join(__dirname, '../../../public', (request.params as Record<string, string>)['*']!),
    ];

    for (const filePath of candidates) {
      console.log('trying: ' + filePath);
      const brPath = filePath + '.br';
      const gzPath = filePath + '.gz';

      const mime = getMimeType(filePath);

      if (existsSync(brPath)) {
        reply.header('Content-Encoding', 'br');
        reply.header('cache-control', 'public, max-age=2592000, immutable');
        reply.type(mime).send(await fsp.readFile(brPath));
        return;
      }
      if (existsSync(gzPath)) {
        reply.header('Content-Encoding', 'gzip');
        reply.header('cache-control', 'public, max-age=2592000, immutable');
        reply.type(mime).send(await fsp.readFile(gzPath));
        return;
      }
      if (existsSync(filePath)) {
        reply.header('cache-control', 'public, max-age=2592000, immutable');
        reply.type(mime).send(await fsp.readFile(filePath));
        return;
      }
    }

    reply.code(404).send('File not found');
  });

  app.get('/favicon.ico', (_, reply) => {
    reply.status(404).send();
  });

  app.get('/*', async (req, reply) => {
    // @ts-expect-error ................
    const request = createStandardRequest(req, reply);

    const store = createStore({});
    const handler = createStaticHandler(createRoutes(store));
    const context = await handler.query(request);

    if (context instanceof Response) {
      return reply.send(context);
    }

    const router = createStaticRouter(handler.dataRoutes, context);
    renderToString(
      <StrictMode>
        <StoreProvider createStore={() => store}>
          <StaticRouterProvider context={context} hydrate={false} router={router} />
        </StoreProvider>
      </StrictMode>,
    );

    const rootDir = path.resolve(__dirname, '../../../');
    const _imagePaths = [
      getFilePaths('public/images', rootDir),
      getFilePaths('public/animations', rootDir),
      getFilePaths('public/logos', rootDir),
    ].flat();

    // ${imagePaths.map((imagePath) => `<link as="image" href="${imagePath}" rel="preload" />`).join('\n')}

    const html = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist/index.html'),
    ).toString();

    reply
      .type('text/html')
      .header('cache-control', 'no-store')
      .send(
        html +
          /* html */ dedent`
          <script>
            window.__staticRouterHydrationData = ${htmlescape({
              actionData: context.actionData,
              loaderData: context.loaderData,
            })};
          </script>
        `,
      );
  });
}
