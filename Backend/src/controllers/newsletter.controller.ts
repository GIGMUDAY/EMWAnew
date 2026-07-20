import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { validate } from '../middleware/core.js';
import { asyncHandler } from '../utils/http.js';

export const publicNewsletter = Router();

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
