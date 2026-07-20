import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../db/index.js';

const migrationName = process.argv[2] ?? '001_initial.sql';

if (path.basename(migrationName) !== migrationName || !migrationName.endsWith('.sql')) {
  throw new Error('Migration must be a SQL filename from src/database/migrations');
}

try {
  const migrationUrl = new URL(`./migrations/${migrationName}`, import.meta.url);
  const sql = await readFile(migrationUrl, 'utf8');
  await pool.query(sql);
  console.log(`Migration complete: ${migrationName}`);
} finally {
  await pool.end();
}
