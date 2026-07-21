import { beforeAll, describe, expect, it, vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://unused:unused@localhost/unused';
process.env.JWT_ACCESS_SECRET = 'test-secret-that-is-at-least-32-characters';

const query = vi.fn();
vi.mock('../src/db/index.js', () => ({ pool: { query }, tx: vi.fn() }));

let request: any;
let app: import('express').Express;

beforeAll(async () => {
  request = (await import('supertest')).default;
  app = (await import('../src/app.js')).app;
}, 30_000);

describe('publishing API', () => {
  it('lists published updates only', async () => {
    query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
    query.mockResolvedValueOnce({
      rows: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          title: 'Published story',
          slug: 'published-story',
        },
      ],
    });

    const response = await request(app).get('/api/v1/public/updates');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(query.mock.calls[0]?.[0]).toContain("status='PUBLISHED'");
  });

  it('rejects invalid public pagination', async () => {
    const response = await request(app).get('/api/v1/public/events?limit=101');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('protects admin publishing routes', async () => {
    const response = await request(app).get('/api/v1/admin/updates');
    expect(response.status).toBe(401);
  });
});
