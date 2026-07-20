import pg from 'pg';
import { env } from './env.js';

const databaseHost = new URL(env.DATABASE_URL).hostname;

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: false,
  max: 10,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  application_name: 'charity-center-api',
});

// Alias used by service modules that prefer the `db.query(...)` naming style.
export const db = pool;

export async function connectDatabase() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log(`Local PostgreSQL connected successfully (${databaseHost})`);
  } finally {
    client.release();
  }
}

export async function tx<T>(run: (client: pg.PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await run(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
