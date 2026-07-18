import { readFile } from 'node:fs/promises'; import { pool } from './index.js';
const sql=await readFile(new URL('./migrations/001_initial.sql',import.meta.url),'utf8'); await pool.query(sql); console.log('Migration complete'); await pool.end();
