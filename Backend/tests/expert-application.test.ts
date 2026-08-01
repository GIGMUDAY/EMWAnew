import { beforeAll, describe, expect, it, vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://unused:unused@localhost/unused';
process.env.JWT_ACCESS_SECRET = 'test-secret-that-is-at-least-32-characters';

const query = vi.fn();
vi.mock('../src/db/index.js', () => ({ pool: { query }, tx: vi.fn() }));

let request: any;
let app: any;

beforeAll(async () => {
  request = (await import('supertest')).default;
  app = (await import('../src/app.js')).app;
}, 30_000);

const validApplication = {
  fullName: 'Hana Bekele',
  email: 'HANA@EXAMPLE.COM',
  phone: '+251911234567',
  primaryExpertise: 'Journalism & Media',
  professionalTitle: 'Investigative Reporter',
  location: 'Addis Ababa',
  professionalBiography:
    'An experienced journalist covering governance, community issues, and women in media.',
};

describe('expert application endpoint', () => {
  it('accepts a complete application and normalizes its email address', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 'application-id', status: 'PENDING', profile_photo_url: null }],
    });

    const response = await request(app)
      .post('/api/v1/public/expert-applications')
      .field(validApplication);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO expert_applications'),
      expect.arrayContaining(['hana@example.com', 'Journalism & Media']),
    );
  });

  it('accepts Other as an expert category', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 'other-application-id', status: 'PENDING', profile_photo_url: null }],
    });

    const response = await request(app)
      .post('/api/v1/public/expert-applications')
      .field({ ...validApplication, primaryExpertise: 'Other' });

    expect(response.status).toBe(201);
  });

  it('rejects categories outside the registration dropdown', async () => {
    const response = await request(app)
      .post('/api/v1/public/expert-applications')
      .field({ ...validApplication, primaryExpertise: 'Unknown category' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts an application with email only', async () => {
    const { phone: _phone, ...withoutPhone } = validApplication;
    query.mockResolvedValueOnce({
      rows: [{ id: 'email-only-id', status: 'PENDING', profile_photo_url: null }],
    });
    const response = await request(app)
      .post('/api/v1/public/expert-applications')
      .field(withoutPhone);

    expect(response.status).toBe(201);
  });

  it('accepts an application with phone only', async () => {
    const { email: _email, ...withoutEmail } = validApplication;
    query.mockResolvedValueOnce({
      rows: [{ id: 'phone-only-id', status: 'PENDING', profile_photo_url: null }],
    });
    const response = await request(app)
      .post('/api/v1/public/expert-applications')
      .field(withoutEmail);

    expect(response.status).toBe(201);
  });

  it('rejects an application without email and phone', async () => {
    const { email: _email, phone: _phone, ...withoutContact } = validApplication;
    const response = await request(app)
      .post('/api/v1/public/expert-applications')
      .field(withoutContact);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
