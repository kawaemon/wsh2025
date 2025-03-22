import fsp from 'node:fs/promises';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@libsql/client';
import * as schema from '@wsh-2025/schema/src/database/schema';
import { drizzle } from 'drizzle-orm/libsql';

const SQLITE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../database.sqlite');

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

const mig = (s: string) => path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../migrations/' + s);

const migration =
  fs.readFileSync(mig('0005_flat_sleeper.sql')).toString() +
  '\n' +
  fs.readFileSync(mig('0006_new_sheva_callister.sql')).toString();

console.log('migration loaded');
console.log(migration);

export function getDatabase() {
  if (database == null) {
    throw new Error('database is initializing.');
  }
  return database;
}

export async function initializeDatabase(): Promise<void> {
  database?.$client.close();
  database = null;

  const TEMP_PATH = path.resolve(await fsp.mkdtemp(path.resolve(os.tmpdir(), './wsh-')), './database.sqlite');
  await fsp.copyFile(SQLITE_PATH, TEMP_PATH);

  database = drizzle({
    client: createClient({
      syncInterval: 1000,
      url: `file:${TEMP_PATH}`,
    }),
    schema,
  });

  console.log('running migration');
  await database.$client.executeMultiple(migration);
  console.log('migration successed?\n');
}
