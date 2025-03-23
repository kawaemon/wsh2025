import '@wsh-2025/server/src/setups/luxon';

import { registerApi } from '@wsh-2025/server/src/api';
import { initializeDatabase } from '@wsh-2025/server/src/drizzle/database';
import { serve } from '@hono/node-server';
import { registerSsr } from '@wsh-2025/server/src/ssr';
import { registerStreams } from '@wsh-2025/server/src/streams';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

async function main() {
  await initializeDatabase();

  const hono = new Hono();

  hono.use('*', cors());

  hono.route('/api', registerApi());
  hono.route('/', registerStreams());
  hono.route('/', registerSsr());

  const port = Number(process.env['PORT']);
  serve({ fetch: hono.fetch, port });
  console.log(`Server listening at ${port}`);
}

void main();
