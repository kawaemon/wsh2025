import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { fileURLToPath } from 'node:url';
import { serveStatic } from '@hono/node-server/serve-static';

// function getFiles(parent: string): string[] {
//   const dirents = readdirSync(parent, { withFileTypes: true });
//   return dirents
//     .filter((dirent) => dirent.isFile() && !dirent.name.startsWith('.'))
//     .map((dirent) => path.join(parent, dirent.name));
// }
//
// function getFilePaths(relativePath: string, rootDir: string): string[] {
//   const files = getFiles(path.resolve(rootDir, relativePath));
//   return files.map((file) => path.join('/', path.relative(rootDir, file)));
// }

const html = readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist/index.html'),
).toString();

export function registerSsr(): Hono {
  const app = new Hono();

  app.use(
    '/public/*',
    ...[
      path.relative(process.cwd(), path.resolve(path.join(__dirname, '../../client/dist'))),
      path.relative(process.cwd(), path.resolve(path.join(__dirname, '../../../public'))),
    ].map((root) =>
      serveStatic({
        onFound: (_p, c) => {
          c.header('cache-control', 'public, max-age=2592000, immutable');
        },
        root,
        rewriteRequestPath: (p) => {
          const res = p.replace(/^\/public/, '');
          console.log({ p, res });
          return res;
        },
      }),
    ),
  );

  app.get('/*', (c) => {
    return c.html(html);
  });

  return app;
}
