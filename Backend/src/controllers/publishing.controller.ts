import { Router } from 'express';
import { z } from 'zod';
import { pool, tx } from '../db/index.js';
import { validate } from '../middleware/core.js';
import { AppError, notFound } from '../utils/errors.js';
import { asyncHandler, listResponse } from '../utils/http.js';
import { fileUrl, profilePhotoUpload, removeLocal } from '../utils/storage.js';

export const publicPublishing = Router();
export const adminPublishing = Router();

const idSchema = z.object({ id: z.string().uuid() });
const slugSchema = z.object({ slug: z.string().trim().min(1).max(240) });
const statusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const booleanField = z.preprocess(
  (value) => (value === 'true' ? true : value === 'false' ? false : value),
  z.boolean(),
);
const optionalUrl = z.string().trim().url().max(2000).optional().or(z.literal(''));
const optionalSlug = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(3).max(240).optional(),
);
const optionalDate = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.coerce.date().optional(),
);
const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: statusSchema.optional(),
  type: z.string().trim().max(100).optional(),
  featured: booleanField.optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const updateCreateSchema = z.object({
  title: z.string().trim().min(3).max(220),
  slug: optionalSlug,
  excerpt: z.string().trim().min(10).max(1000),
  content: z.string().trim().min(30).max(100000),
  contentType: z.enum(['NEWS', 'PRESS', 'ARTICLE', 'PHOTO', 'VIDEO']),
  videoUrl: optionalUrl,
  authorName: z.string().trim().min(2).max(150),
  status: statusSchema.default('DRAFT'),
  isFeatured: booleanField.default(false),
});

const eventCreateSchema = z.object({
  title: z.string().trim().min(3).max(220),
  slug: optionalSlug,
  description: z.string().trim().min(10).max(50000),
  eventType: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(240),
  startsAt: z.coerce.date(),
  endsAt: optionalDate,
  registrationUrl: optionalUrl,
  capacityStatus: z.enum(['AVAILABLE', 'AT_CAPACITY', 'CANCELLED']).default('AVAILABLE'),
  status: statusSchema.default('DRAFT'),
});

const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 220) || 'item';

async function uniqueSlug(table: 'updates' | 'events', requested: string, ignoreId?: string) {
  const base = slugify(requested);
  let candidate = base;
  let suffix = 2;
  while (
    (
      await pool.query(
        `SELECT 1 FROM ${table} WHERE lower(slug)=lower($1) AND ($2::uuid IS NULL OR id<>$2)`,
        [candidate, ignoreId ?? null],
      )
    ).rowCount
  ) {
    candidate = `${base.slice(0, 230 - String(suffix).length)}-${suffix++}`;
  }
  return candidate;
}

publicPublishing.get(
  '/updates',
  validate(listSchema.omit({ status: true }), 'query'),
  asyncHandler(async (request, response) => {
    const query = request.query as unknown as z.infer<typeof listSchema>;
    const values: unknown[] = [];
    const where = [`status='PUBLISHED'`];
    if (query.type) {
      values.push(query.type);
      where.push(`content_type=$${values.length}`);
    }
    if (query.featured !== undefined) {
      values.push(query.featured);
      where.push(`is_featured=$${values.length}`);
    }
    if (query.search) {
      values.push(`%${query.search}%`);
      where.push(`(title ILIKE $${values.length} OR excerpt ILIKE $${values.length})`);
    }
    const clause = `WHERE ${where.join(' AND ')}`;
    const total = Number((await pool.query(`SELECT count(*) FROM updates ${clause}`, values)).rows[0].count);
    values.push(query.limit, (query.page - 1) * query.limit);
    const { rows } = await pool.query(
      `SELECT id,title,slug,excerpt,content_type,featured_image_url,video_url,author_name,is_featured,published_at,created_at,updated_at
       FROM updates ${clause}
       ORDER BY is_featured DESC, published_at ${query.order}, created_at ${query.order}
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    listResponse(response, rows, total, query.page, query.limit);
  }),
);

publicPublishing.get(
  '/updates/:slug',
  validate(slugSchema, 'params'),
  asyncHandler(async (request, response) => {
    const { rows } = await pool.query(
      `SELECT id,title,slug,excerpt,content,content_type,featured_image_url,video_url,author_name,is_featured,published_at,created_at,updated_at
       FROM updates WHERE lower(slug)=lower($1) AND status='PUBLISHED'`,
      [request.params.slug],
    );
    if (!rows[0]) throw notFound('Update');
    response.json({ success: true, data: rows[0] });
  }),
);

publicPublishing.get(
  '/events',
  validate(listSchema.omit({ status: true, featured: true }), 'query'),
  asyncHandler(async (request, response) => {
    const query = request.query as unknown as z.infer<typeof listSchema>;
    const values: unknown[] = [];
    const where = [`status='PUBLISHED'`];
    if (query.type) {
      values.push(query.type);
      where.push(`event_type=$${values.length}`);
    }
    if (query.search) {
      values.push(`%${query.search}%`);
      where.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }
    const clause = `WHERE ${where.join(' AND ')}`;
    const total = Number((await pool.query(`SELECT count(*) FROM events ${clause}`, values)).rows[0].count);
    values.push(query.limit, (query.page - 1) * query.limit);
    const { rows } = await pool.query(
      `SELECT id,title,slug,description,event_type,location,starts_at,ends_at,registration_url,capacity_status,featured_image_url,created_at,updated_at
       FROM events ${clause} ORDER BY starts_at ${query.order}
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    listResponse(response, rows, total, query.page, query.limit);
  }),
);

publicPublishing.get(
  '/events/:id',
  validate(idSchema, 'params'),
  asyncHandler(async (request, response) => {
    const { rows } = await pool.query(
      `SELECT id,title,slug,description,event_type,location,starts_at,ends_at,registration_url,capacity_status,featured_image_url,created_at,updated_at
       FROM events WHERE id=$1 AND status='PUBLISHED'`,
      [request.params.id],
    );
    if (!rows[0]) throw notFound('Event');
    response.json({ success: true, data: rows[0] });
  }),
);

adminPublishing.get(
  '/updates',
  validate(listSchema, 'query'),
  asyncHandler(async (request, response) => {
    const query = request.query as unknown as z.infer<typeof listSchema>;
    const values: unknown[] = [];
    const where: string[] = [];
    if (query.status) {
      values.push(query.status);
      where.push(`u.status=$${values.length}`);
    }
    if (query.type) {
      values.push(query.type);
      where.push(`u.content_type=$${values.length}`);
    }
    if (query.search) {
      values.push(`%${query.search}%`);
      where.push(`(u.title ILIKE $${values.length} OR u.excerpt ILIKE $${values.length})`);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = Number((await pool.query(`SELECT count(*) FROM updates u ${clause}`, values)).rows[0].count);
    values.push(query.limit, (query.page - 1) * query.limit);
    const { rows } = await pool.query(
      `SELECT u.*,a.full_name AS created_by_name FROM updates u JOIN admins a ON a.id=u.created_by
       ${clause} ORDER BY u.updated_at ${query.order} LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    listResponse(response, rows, total, query.page, query.limit);
  }),
);

adminPublishing.get('/updates/:id', validate(idSchema, 'params'), asyncHandler(async (request, response) => {
  const { rows } = await pool.query('SELECT * FROM updates WHERE id=$1', [request.params.id]);
  if (!rows[0]) throw notFound('Update');
  response.json({ success: true, data: rows[0] });
}));

adminPublishing.post(
  '/updates',
  profilePhotoUpload.single('featuredImage'),
  asyncHandler(async (request, response) => {
    try {
      const body = updateCreateSchema.parse(request.body);
      const slug = await uniqueSlug('updates', body.slug || body.title);
      const image = request.file ? fileUrl(request, request.file) : null;
      const row = await tx(async (client) => {
        if (body.isFeatured && body.status === 'PUBLISHED') {
          await client.query(`UPDATE updates SET is_featured=false,updated_at=now() WHERE is_featured=true`);
        }
        const { rows } = await client.query(
          `INSERT INTO updates(title,slug,excerpt,content,content_type,featured_image_url,video_url,author_name,status,is_featured,published_at,created_by)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::varchar,$10,CASE WHEN $9::varchar='PUBLISHED' THEN now() ELSE NULL END,$11) RETURNING *`,
          [body.title, slug, body.excerpt, body.content, body.contentType, image, body.videoUrl || null, body.authorName, body.status, body.isFeatured, request.admin!.id],
        );
        await client.query(
          `INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id,metadata) VALUES($1,'UPDATE_CREATED','update',$2,$3)`,
          [request.admin!.id, rows[0].id, { status: body.status }],
        );
        return rows[0];
      });
      response.status(201).json({ success: true, data: row });
    } catch (error) {
      if (request.file) await removeLocal(request.file.path);
      throw error;
    }
  }),
);

adminPublishing.patch(
  '/updates/:id',
  validate(idSchema, 'params'),
  profilePhotoUpload.single('featuredImage'),
  asyncHandler(async (request, response) => {
    try {
      const body = updateCreateSchema.partial().parse(request.body);
      const current = (await pool.query('SELECT * FROM updates WHERE id=$1', [request.params.id])).rows[0];
      if (!current) throw notFound('Update');
      const slug = body.slug ? await uniqueSlug('updates', body.slug, String(request.params.id)) : undefined;
      const image = request.file ? fileUrl(request, request.file) : undefined;
      const row = await tx(async (client) => {
        const nextStatus = body.status ?? current.status;
        const nextFeatured = body.isFeatured ?? current.is_featured;
        if (nextFeatured && nextStatus === 'PUBLISHED') {
          await client.query('UPDATE updates SET is_featured=false,updated_at=now() WHERE is_featured=true AND id<>$1', [request.params.id]);
        }
        const { rows } = await client.query(
          `UPDATE updates SET title=COALESCE($1,title),slug=COALESCE($2,slug),excerpt=COALESCE($3,excerpt),content=COALESCE($4,content),content_type=COALESCE($5,content_type),featured_image_url=COALESCE($6,featured_image_url),video_url=COALESCE($7,video_url),author_name=COALESCE($8,author_name),status=COALESCE($9::varchar,status),is_featured=COALESCE($10,is_featured),published_at=CASE WHEN $9::varchar='PUBLISHED' AND published_at IS NULL THEN now() WHEN $9::varchar IN ('DRAFT','ARCHIVED') THEN NULL ELSE published_at END,updated_at=now() WHERE id=$11 RETURNING *`,
          [body.title, slug, body.excerpt, body.content, body.contentType, image, body.videoUrl || undefined, body.authorName, body.status, body.isFeatured, request.params.id],
        );
        await client.query(`INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id,metadata) VALUES($1,'UPDATE_CHANGED','update',$2,$3)`, [request.admin!.id, request.params.id, body]);
        return rows[0];
      });
      if (image && current.featured_image_url) await removeLocal(current.featured_image_url);
      response.json({ success: true, data: row });
    } catch (error) {
      if (request.file) await removeLocal(request.file.path);
      throw error;
    }
  }),
);

adminPublishing.delete('/updates/:id', validate(idSchema, 'params'), asyncHandler(async (request, response) => {
  const row = await tx(async (client) => {
    const { rows } = await client.query('DELETE FROM updates WHERE id=$1 RETURNING featured_image_url', [request.params.id]);
    if (!rows[0]) throw notFound('Update');
    await client.query(`INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id) VALUES($1,'UPDATE_DELETED','update',$2)`, [request.admin!.id, request.params.id]);
    return rows[0];
  });
  if (row.featured_image_url) await removeLocal(row.featured_image_url);
  response.status(204).end();
}));

adminPublishing.get('/events', validate(listSchema, 'query'), asyncHandler(async (request, response) => {
  const query = request.query as unknown as z.infer<typeof listSchema>;
  const values: unknown[] = [];
  const where: string[] = [];
  if (query.status) { values.push(query.status); where.push(`e.status=$${values.length}`); }
  if (query.type) { values.push(query.type); where.push(`e.event_type=$${values.length}`); }
  if (query.search) { values.push(`%${query.search}%`); where.push(`(e.title ILIKE $${values.length} OR e.location ILIKE $${values.length})`); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = Number((await pool.query(`SELECT count(*) FROM events e ${clause}`, values)).rows[0].count);
  values.push(query.limit, (query.page - 1) * query.limit);
  const { rows } = await pool.query(`SELECT e.*,a.full_name AS created_by_name FROM events e JOIN admins a ON a.id=e.created_by ${clause} ORDER BY e.starts_at ${query.order} LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
  listResponse(response, rows, total, query.page, query.limit);
}));

adminPublishing.get('/events/:id', validate(idSchema, 'params'), asyncHandler(async (request, response) => {
  const { rows } = await pool.query('SELECT * FROM events WHERE id=$1', [request.params.id]);
  if (!rows[0]) throw notFound('Event');
  response.json({ success: true, data: rows[0] });
}));

adminPublishing.post('/events', profilePhotoUpload.single('featuredImage'), asyncHandler(async (request, response) => {
  try {
    const body = eventCreateSchema.parse(request.body);
    if (body.endsAt && body.endsAt < body.startsAt) throw new AppError(400, 'INVALID_EVENT_DATES', 'End date must be after start date');
    const slug = await uniqueSlug('events', body.slug || body.title);
    const image = request.file ? fileUrl(request, request.file) : null;
    const row = await tx(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO events(title,slug,description,event_type,location,starts_at,ends_at,registration_url,capacity_status,featured_image_url,status,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [body.title, slug, body.description, body.eventType, body.location, body.startsAt, body.endsAt || null, body.registrationUrl || null, body.capacityStatus, image, body.status, request.admin!.id],
      );
      await client.query(`INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id,metadata) VALUES($1,'EVENT_CREATED','event',$2,$3)`, [request.admin!.id, rows[0].id, { status: body.status }]);
      return rows[0];
    });
    response.status(201).json({ success: true, data: row });
  } catch (error) {
    if (request.file) await removeLocal(request.file.path);
    throw error;
  }
}));

adminPublishing.patch('/events/:id', validate(idSchema, 'params'), profilePhotoUpload.single('featuredImage'), asyncHandler(async (request, response) => {
  try {
    const body = eventCreateSchema.partial().parse(request.body);
    const current = (await pool.query('SELECT * FROM events WHERE id=$1', [request.params.id])).rows[0];
    if (!current) throw notFound('Event');
    const startsAt = body.startsAt ?? current.starts_at;
    const endsAt = body.endsAt === undefined ? current.ends_at : body.endsAt;
    if (endsAt && new Date(endsAt) < new Date(startsAt)) throw new AppError(400, 'INVALID_EVENT_DATES', 'End date must be after start date');
    const slug = body.slug ? await uniqueSlug('events', body.slug, String(request.params.id)) : undefined;
    const image = request.file ? fileUrl(request, request.file) : undefined;
    const row = await tx(async (client) => {
      const { rows } = await client.query(
        `UPDATE events SET title=COALESCE($1,title),slug=COALESCE($2,slug),description=COALESCE($3,description),event_type=COALESCE($4,event_type),location=COALESCE($5,location),starts_at=COALESCE($6,starts_at),ends_at=COALESCE($7,ends_at),registration_url=COALESCE($8,registration_url),capacity_status=COALESCE($9,capacity_status),featured_image_url=COALESCE($10,featured_image_url),status=COALESCE($11,status),updated_at=now() WHERE id=$12 RETURNING *`,
        [body.title, slug, body.description, body.eventType, body.location, body.startsAt, body.endsAt, body.registrationUrl || undefined, body.capacityStatus, image, body.status, request.params.id],
      );
      await client.query(`INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id,metadata) VALUES($1,'EVENT_CHANGED','event',$2,$3)`, [request.admin!.id, request.params.id, body]);
      return rows[0];
    });
    if (image && current.featured_image_url) await removeLocal(current.featured_image_url);
    response.json({ success: true, data: row });
  } catch (error) {
    if (request.file) await removeLocal(request.file.path);
    throw error;
  }
}));

adminPublishing.delete('/events/:id', validate(idSchema, 'params'), asyncHandler(async (request, response) => {
  const row = await tx(async (client) => {
    const { rows } = await client.query('DELETE FROM events WHERE id=$1 RETURNING featured_image_url', [request.params.id]);
    if (!rows[0]) throw notFound('Event');
    await client.query(`INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id) VALUES($1,'EVENT_DELETED','event',$2)`, [request.admin!.id, request.params.id]);
    return rows[0];
  });
  if (row.featured_image_url) await removeLocal(row.featured_image_url);
  response.status(204).end();
}));
