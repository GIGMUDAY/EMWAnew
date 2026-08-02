import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { validate } from '../middleware/core.js';
import { asyncHandler } from '../utils/http.js';
import { AppError } from '../utils/errors.js';

const requestSchema = z.object({
  texts: z.array(z.string().trim().min(1).max(5000)).min(1).max(50),
  source: z.literal('en').default('en'),
  target: z.enum(['am', 'en']),
});

type GoogleTranslationResponse = {
  data?: { translations?: Array<{ translatedText?: string }> };
  error?: { message?: string };
};

const decodeEntities = (value: string) =>
  value
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

export const publicTranslations = Router();

publicTranslations.post(
  '/translations',
  validate(requestSchema),
  asyncHandler(async (request, response) => {
    if (!env.GOOGLE_TRANSLATE_API_KEY) {
      throw new AppError(503, 'TRANSLATION_NOT_CONFIGURED', 'Google Translation is not configured');
    }

    const { texts, source, target } = request.body as z.infer<typeof requestSchema>;
    if (source === target) return response.json({ success: true, data: texts });

    const googleResponse = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(env.GOOGLE_TRANSLATE_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: texts, source, target, format: 'text' }),
      },
    );
    const payload = (await googleResponse.json().catch(() => null)) as GoogleTranslationResponse | null;
    if (!googleResponse.ok) {
      throw new AppError(502, 'TRANSLATION_FAILED', payload?.error?.message || 'Translation service unavailable');
    }

    const translations = payload?.data?.translations?.map((item) => decodeEntities(item.translatedText || ''));
    if (!translations || translations.length !== texts.length) {
      throw new AppError(502, 'TRANSLATION_FAILED', 'Translation service returned an incomplete response');
    }
    response.setHeader('Cache-Control', 'public, max-age=86400');
    response.json({ success: true, data: translations });
  }),
);
