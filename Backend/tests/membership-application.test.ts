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

const officialEnglishApplication = {
  membershipTypeId: '00000000-0000-4000-8000-000000000002',
  fullName: 'Hana Bekele',
  email: 'hana@example.com',
  phone: '+251911234567',
  outletOrInstitution: 'Addis Media',
  currentRole: 'Reporter',
  regionOrChapter: 'Addis Ababa',
  additionalInformation: {
    dateOfBirth: '1995-06-15',
    citySubCity: 'Addis Ababa / Bole',
    woreda: '03',
    houseNumber: '125',
    additionalSkills: 'Fact-checking and multimedia production',
    emergencyContact1: { name: 'Sara Bekele', phone: '+251922345678' },
    emergencyContact2: { name: 'Marta Bekele', phone: '+251933456789' },
    yearsOfExperience: 5,
    department: 'News',
    educationLevel: "Bachelor's degree",
    fieldOfStudy: 'Journalism',
  },
};

describe('official English membership application', () => {
  it('validates and stores all official fields', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 'membership-id', status: 'PENDING', created_at: new Date().toISOString() }],
    });

    const response = await request(app)
      .post('/api/v1/public/membership-applications')
      .send(officialEnglishApplication);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO membership_applications'),
      expect.arrayContaining([
        expect.objectContaining({
          dateOfBirth: '1995-06-15',
          yearsOfExperience: 5,
          educationLevel: "Bachelor's degree",
          emergencyContact2: { name: 'Marta Bekele', phone: '+251933456789' },
        }),
      ]),
    );
  });

  it('rejects an application without its required emergency contact', async () => {
    const response = await request(app)
      .post('/api/v1/public/membership-applications')
      .send({
        ...officialEnglishApplication,
        additionalInformation: {
          ...officialEnglishApplication.additionalInformation,
          emergencyContact1: undefined,
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
