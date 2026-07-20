import bcrypt from 'bcrypt';
import { z } from 'zod';
import { pool } from '../src/db/index.js';

const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => argument.replace(/^--/, '').split('=')),
);

const input = z.object({
  name: z.string().min(2),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(12)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
}).parse(args);

const passwordHash = await bcrypt.hash(input.password, 12);

try {
  const { rows } = await pool.query(
    `INSERT INTO admins (full_name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, 'SUPER_ADMIN', true)
     ON CONFLICT (email) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       password_hash = EXCLUDED.password_hash,
       role = 'SUPER_ADMIN',
       is_active = true,
       updated_at = now()
     RETURNING id, full_name, email, role, is_active`,
    [input.name, input.email, passwordHash],
  );

  console.log('Super administrator created or restored:', rows[0]);
} finally {
  await pool.end();
}
