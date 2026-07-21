import pg from 'pg';
import { env } from './env.js';

const databaseHost = new URL(env.DATABASE_URL).hostname;
const isLocalDatabase = ['localhost', '127.0.0.1', '::1'].includes(databaseHost);
const databaseSsl =
  env.DATABASE_SSL === 'require' || (env.DATABASE_SSL === 'auto' && !isLocalDatabase)
    ? { rejectUnauthorized: false }
    : false;

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: databaseSsl,
  max: 10,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  application_name: 'charity-center-api',
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

// Alias used by service modules that prefer the `db.query(...)` naming style.
export const db = pool;

export async function connectDatabase() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log(`PostgreSQL connected successfully (${databaseHost}, SSL: ${databaseSsl ? 'on' : 'off'})`);
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
