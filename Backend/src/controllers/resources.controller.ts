import { Router } from 'express';
import path from 'node:path';
import { z } from 'zod';
import { env } from '../config/env.js';
import { pool, tx } from '../db/index.js';
import { asyncHandler, listResponse, pageSchema } from '../utils/http.js';
import { validate } from '../middleware/core.js';
import { upload, fileUrl, removeLocal } from '../utils/storage.js';
import { AppError, notFound } from '../utils/errors.js';

export const publicResources = Router();
export const adminResources = Router();
const id = z.object({ id: z.string().uuid() });

publicResources.get(
  '/resources',
  asyncHandler(async (_request, response) => {
    const { rows } = await pool.query(
      `SELECT id,title,description,file_url,mime_type,file_size,created_at,updated_at
       FROM resources WHERE is_published=true ORDER BY created_at DESC`,
    );
    response.json({ success: true, data: rows });
  }),
);

publicResources.get(
  '/resources/:id',
  validate(id, 'params'),
  asyncHandler(async (request, response) => {
    const { rows } = await pool.query(
      `SELECT id,title,description,file_url,mime_type,file_size,created_at,updated_at
       FROM resources WHERE id=$1 AND is_published=true`,
      [request.params.id],
    );
    if (!rows[0]) throw notFound('Resource');
    response.json({ success: true, data: rows[0] });
  }),
);

publicResources.get(
  '/resources/:id/download',
  validate(id, 'params'),
  asyncHandler(async (request, response) => {
    const { rows } = await pool.query(
      `SELECT file_url,original_filename
       FROM resources WHERE id=$1 AND is_published=true`,
      [request.params.id],
    );
    if (!rows[0]) throw notFound('Resource');

    const resource = rows[0] as { file_url: string; original_filename: string };
    const localFile = path.resolve(env.UPLOAD_DIR, path.basename(resource.file_url));
    await new Promise<void>((resolve, reject) => {
      response.download(localFile, resource.original_filename, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }),
);

adminResources.get(
  '/resources',
  validate(pageSchema, 'query'),
  asyncHandler(async (request, response) => {
    const query: any = request.query;
    const total = Number((await pool.query('SELECT count(*) FROM resources')).rows[0].count);
    const { rows } = await pool.query(
      `SELECT * FROM resources ORDER BY ${query.sort} ${query.order} LIMIT $1 OFFSET $2`,
      [query.limit, (query.page - 1) * query.limit],
    );
    listResponse(response, rows, total, query.page, query.limit);
  }),
);

adminResources.post(
  '/resources',
  upload.single('file'),
  asyncHandler(async (request, response) => {
    if (!request.file) throw new AppError(400, 'FILE_REQUIRED', 'A file is required');
    const { title, description } = request.body;
    if (!title || !description) {
      await removeLocal(request.file.path);
      throw new AppError(400, 'VALIDATION_ERROR', 'title and description are required');
    }
    try {
      const row = await tx(async (client) => {
        const { rows } = await client.query(
          `INSERT INTO resources
            (title,description,file_url,original_filename,mime_type,file_size,uploaded_by)
           VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [
            title,
            description,
            fileUrl(request, request.file!),
            request.file!.originalname,
            request.file!.mimetype,
            request.file!.size,
            request.admin!.id,
          ],
        );
        await client.query(
          "INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id) VALUES($1,'RESOURCE_UPLOADED','resource',$2)",
          [request.admin!.id, rows[0].id],
        );
        return rows[0];
      });
      response.status(201).json({ success: true, data: row });
    } catch (error) {
      await removeLocal(request.file.path);
      throw error;
    }
  }),
);

adminResources.patch(
  '/resources/:id',
  validate(id, 'params'),
  validate(
    z.object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().min(1).max(10000).optional(),
      isPublished: z.boolean().optional(),
    }),
  ),
  asyncHandler(async (request, response) => {
    const body = request.body;
    const row = await tx(async (client) => {
      const { rows } = await client.query(
        `UPDATE resources
         SET title=COALESCE($1,title),description=COALESCE($2,description),
             is_published=COALESCE($3,is_published),updated_at=now()
         WHERE id=$4 RETURNING *`,
        [body.title, body.description, body.isPublished, request.params.id],
      );
      if (!rows[0]) throw notFound('Resource');
      if (body.isPublished !== undefined) {
        await client.query(
          'INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4)',
          [
            request.admin!.id,
            body.isPublished ? 'RESOURCE_PUBLISHED' : 'RESOURCE_UNPUBLISHED',
            'resource',
            request.params.id,
          ],
        );
      }
      return rows[0];
    });
    response.json({ success: true, data: row });
  }),
);

adminResources.delete(
  '/resources/:id',
  validate(id, 'params'),
  asyncHandler(async (request, response) => {
    const row = await tx(async (client) => {
      const { rows } = await client.query(
        'DELETE FROM resources WHERE id=$1 RETURNING file_url',
        [request.params.id],
      );
      if (!rows[0]) throw notFound('Resource');
      await client.query(
        "INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id) VALUES($1,'RESOURCE_DELETED','resource',$2)",
        [request.admin!.id, request.params.id],
      );
      return rows[0];
    });
    await removeLocal(row.file_url);
    response.status(204).end();
  }),
);
