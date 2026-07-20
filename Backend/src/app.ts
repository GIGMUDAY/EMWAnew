import path from 'node:path';
import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/core.js';
import authRouter from './routes/auth.routes.js';
import workflowRouter from './routes/workflow.router.js';
import { AppError } from './utils/errors.js';

export const app = express();

app.set('trust proxy', env.TRUST_PROXY === 'true');
app.use(helmet());

const allowedOrigins = new Set(
  env.CORS_ORIGINS.split(',').map((origin) => origin.trim().replace(/\/$/, '')),
);

app.use(cors({
  origin: (origin, callback) => {
    const normalizedOrigin = origin?.replace(/\/$/, '');
    if (!normalizedOrigin || allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new AppError(403, 'CORS_REJECTED', `Origin ${normalizedOrigin} is not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR), { fallthrough: false }));

const authLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const publicLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.get('/health', (_request, response) => {
  response.json({ success: true, data: { status: 'ok' } });
});

app.get('/api/docs.json', (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.json(swaggerSpec);
});

app.use(
  '/api/docs',
  (_request: Request, response: Response, next: NextFunction) => {
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.setHeader('Pragma', 'no-cache');
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

// API mounting vectors.
app.use('/api/v1/auth/login', authLimit);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/public', publicLimit);
app.use('/api/v1', workflowRouter);

app.use((_request, _response, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
});
app.use(errorHandler);

export default app;
