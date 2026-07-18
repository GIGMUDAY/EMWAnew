import pg from 'pg'; import { env } from '../config/env.js';
export const pool=new pg.Pool({connectionString:env.DATABASE_URL,ssl:env.NODE_ENV==='production'?{rejectUnauthorized:true}:undefined,max:20});
export async function tx<T>(fn:(c:pg.PoolClient)=>Promise<T>){const c=await pool.connect();try{await c.query('BEGIN');const out=await fn(c);await c.query('COMMIT');return out}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
