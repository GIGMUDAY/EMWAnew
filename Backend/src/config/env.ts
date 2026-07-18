import 'dotenv/config';
import { z } from 'zod';
const schema=z.object({NODE_ENV:z.enum(['development','test','production']).default('development'),PORT:z.coerce.number().int().positive().default(4000),DATABASE_URL:z.string().min(1),JWT_ACCESS_SECRET:z.string().min(32),JWT_ACCESS_TTL:z.string().default('15m'),REFRESH_TOKEN_TTL_DAYS:z.coerce.number().int().positive().default(30),CORS_ORIGINS:z.string().default('http://localhost:3000'),UPLOAD_DIR:z.string().default('uploads'),MAX_FILE_SIZE_MB:z.coerce.number().positive().default(10),TRUST_PROXY:z.enum(['true','false']).default('false')});
export const env=schema.parse(process.env);
