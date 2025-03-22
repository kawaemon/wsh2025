import { readdirSync, readFileSync, existsSync } from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { FastifyInstance } from 'fastify';

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

interface Cached {
  mime: string;
  data: Buffer;
  encoding: string | null;
}

const cache: Record<string, Cached> = {};

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
    const param = (request.params as Record<string, string>)['*']!;

    const c = cache[param];
    if (c != null) {
      if (c.encoding) {
        reply.header('Content-Encoding', c.encoding);
      }
      reply.header('cache-control', 'public, max-age=2592000, immutable');
      reply.type(c.mime).send(c.data);
      return;
    }

    const candidates = [
      path.join(__dirname, '../../client/dist', param),
      path.join(__dirname, '../../../public', param),
    ];

    for (const filePath of candidates) {
      const brPath = filePath + '.br';
      const gzPath = filePath + '.gz';

      const mime = getMimeType(filePath);

      if (existsSync(brPath)) {
        reply.header('Content-Encoding', 'br');
        reply.header('cache-control', 'public, max-age=2592000, immutable');
        const data = await fsp.readFile(brPath);
        cache[param] = { mime, encoding: 'br', data };
        reply.type(mime).send(data);
        return;
      }
      if (existsSync(gzPath)) {
        reply.header('Content-Encoding', 'gzip');
        reply.header('cache-control', 'public, max-age=2592000, immutable');
        const data = await fsp.readFile(gzPath);
        cache[param] = { mime, encoding: 'gzip', data };
        reply.type(mime).send();
        return;
      }
      if (existsSync(filePath)) {
        reply.header('cache-control', 'public, max-age=2592000, immutable');
        const data = await fsp.readFile(filePath);
        cache[param] = { mime, encoding: null, data };
        reply.type(mime).send();
        return;
      }
    }

    reply.code(404).send('File not found');
  });

  app.get('/favicon.ico', (_, reply) => {
    reply.status(404).send();
  });

  app.get('/*', async (_req, reply) => {
    const html = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist/index.html'),
    ).toString();

    reply.type('text/html').header('cache-control', 'no-store').send(html);
  });
}
