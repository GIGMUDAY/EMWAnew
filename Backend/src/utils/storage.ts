import crypto from 'node:crypto';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { Request } from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from './errors.js';

const imageTypes = new Set(['image/jpeg', 'image/png']);
const resourceTypes = new Set([
  ...imageTypes,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

await mkdir(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (_request, file, callback) => {
    callback(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
  },
});

const uploader = (allowedTypes: Set<string>) => multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (allowedTypes.has(file.mimetype)) return callback(null, true);
    return callback(new AppError(400, 'INVALID_FILE_TYPE', 'Unsupported file MIME type'));
  },
});

export const upload = uploader(resourceTypes);
export const profilePhotoUpload = uploader(imageTypes);

export const fileUrl = (request: Request, file: Express.Multer.File) =>
  `${request.protocol}://${request.get('host')}/uploads/${file.filename}`;

export const removeLocal = (url: string) =>
  unlink(path.join(env.UPLOAD_DIR, path.basename(url))).catch(() => undefined);
