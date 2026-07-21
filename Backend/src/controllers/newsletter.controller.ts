import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { validate } from '../middleware/core.js';
import { asyncHandler, listResponse, pageSchema } from '../utils/http.js';

export const publicNewsletter = Router();
export const adminNewsletter = Router();

const subscriptionSchema = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
});

publicNewsletter.post(
  '/newsletter-subscriptions',
  validate(subscriptionSchema),
  asyncHandler(async (request, response) => {
    const { rows } = await pool.query(
      `INSERT INTO newsletter_subscribers (email)
       VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET
         status = 'ACTIVE',
         subscribed_at = CASE
           WHEN newsletter_subscribers.status = 'UNSUBSCRIBED' THEN now()
           ELSE newsletter_subscribers.subscribed_at
         END,
         unsubscribed_at = NULL,
         updated_at = now()
       RETURNING id, email, status, subscribed_at`,
      [request.body.email],
    );

    response.status(201).json({
      success: true,
      data: rows[0],
      message: 'Subscription confirmed.',
    });
  }),
);

const subscriberListSchema = pageSchema.extend({
  status: z.enum(['ACTIVE', 'UNSUBSCRIBED']).optional(),
});

adminNewsletter.get(
  '/newsletter-subscribers',
  validate(subscriberListSchema, 'query'),
  asyncHandler(async (request, response) => {
    const query = request.query as unknown as z.infer<typeof subscriberListSchema>;
    const values: unknown[] = [];
    const conditions: string[] = [];
    if (query.status) {
      values.push(query.status);
      conditions.push(`status=$${values.length}`);
    }
    if (query.search) {
      values.push(`%${query.search}%`);
      conditions.push(`email ILIKE $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = Number(
      (await pool.query(`SELECT count(*) FROM newsletter_subscribers ${where}`, values)).rows[0]
        .count,
    );
    values.push(query.limit, (query.page - 1) * query.limit);
    const { rows } = await pool.query(
      `SELECT id,email,status,subscribed_at,unsubscribed_at,created_at,updated_at
       FROM newsletter_subscribers ${where}
       ORDER BY ${query.sort} ${query.order}
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    listResponse(response, rows, total, query.page, query.limit);
  }),
);
