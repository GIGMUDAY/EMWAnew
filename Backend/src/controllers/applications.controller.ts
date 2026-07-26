import { Router } from 'express';
import { z } from 'zod';
import { EXPERT_CATEGORIES } from '../constants/expert-categories.js';
import { pool, tx } from '../db/index.js';
import { validate } from '../middleware/core.js';
import { asyncHandler, listResponse, pageSchema } from '../utils/http.js';
import { AppError, notFound } from '../utils/errors.js';
import { fileUrl, profilePhotoUpload, removeLocal } from '../utils/storage.js';

export const publicApplications = Router(), adminApplications = Router();
const email = z.string().trim().email().transform((value) => value.toLowerCase());
const id = z.object({ id: z.string().uuid() });

publicApplications.get('/experts', asyncHandler(async (_request, response) => {
  const { rows } = await pool.query(
    "SELECT id,full_name,email,professional_title,area_of_expertise AS primary_expertise,location,biography AS professional_biography,profile_photo_url,linkedin_url,instagram_url,facebook_url,created_at FROM expert_applications WHERE status='APPROVED' ORDER BY created_at DESC",
  );
  response.json({ success: true, data: rows });
}));

const expertApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email,
  phone: z.string().trim().min(5).max(40),
  primaryExpertise: z.enum(EXPERT_CATEGORIES),
  professionalTitle: z.string().trim().min(2).max(150),
  location: z.string().trim().min(2).max(150),
  professionalBiography: z.string().trim().min(20).max(10000),
  linkedinUrl: z.string().trim().url().max(2000).optional().or(z.literal('')),
  instagramUrl: z.string().trim().url().max(2000).optional().or(z.literal('')),
  facebookUrl: z.string().trim().url().max(2000).optional().or(z.literal('')),
});

publicApplications.post(
  '/expert-applications',
  profilePhotoUpload.single('profilePhoto'),
  asyncHandler(async (request, response) => {
    try {
      const application = expertApplicationSchema.parse(request.body);
      const photoUrl = request.file ? fileUrl(request, request.file) : null;
      const { rows } = await pool.query(
        `INSERT INTO expert_applications
          (full_name,email,phone_number,professional_title,area_of_expertise,location,biography,
           profile_photo_url,linkedin_url,instagram_url,facebook_url)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id,status,profile_photo_url,created_at`,
        [
          application.fullName,
          application.email,
          application.phone,
          application.professionalTitle,
          application.primaryExpertise,
          application.location,
          application.professionalBiography,
          photoUrl,
          application.linkedinUrl || null,
          application.instagramUrl || null,
          application.facebookUrl || null,
        ],
      );
      response.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      if (request.file) await removeLocal(request.file.path);
      throw error;
    }
  }),
);

const emergencyContactSchema = z.object({
  name: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(5).max(40),
});

const membershipAdditionalInformationSchema = z.object({
  dateOfBirth: z.coerce.date().max(new Date()),
  citySubCity: z.string().trim().min(2).max(150),
  woreda: z.string().trim().max(100).default(''),
  houseNumber: z.string().trim().max(50).default(''),
  additionalSkills: z.string().trim().max(2000).default(''),
  emergencyContact1: emergencyContactSchema,
  emergencyContact2: emergencyContactSchema.optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80),
  department: z.string().trim().max(150).default(''),
  educationLevel: z.string().trim().min(2).max(150),
  fieldOfStudy: z.string().trim().min(2).max(200),
});

const membership = z.object({
  membershipTypeId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(150),
  email,
  phone: z.string().trim().min(5).max(40),
  outletOrInstitution: z.string().trim().min(2).max(200),
  currentRole: z.string().trim().min(2).max(150),
  regionOrChapter: z.string().trim().min(2).max(150),
  additionalInformation: membershipAdditionalInformationSchema,
});

publicApplications.post(
  '/membership-applications',
  validate(membership),
  asyncHandler(async (request, response) => {
    const application = request.body;
    const additionalInformation = {
      ...application.additionalInformation,
      dateOfBirth: application.additionalInformation.dateOfBirth.toISOString().slice(0, 10),
    };
    const { rows } = await pool.query(
      `INSERT INTO membership_applications
        (membership_type_id,full_name,email,phone_number,outlet_or_institution,current_position,region_or_chapter,address,dynamic_data)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9
       FROM membership_types WHERE id=$1 AND is_active=true
       RETURNING id,status,created_at`,
      [
        application.membershipTypeId,
        application.fullName,
        application.email,
        application.phone,
        application.outletOrInstitution,
        application.currentRole,
        application.regionOrChapter,
        [
          additionalInformation.citySubCity,
          additionalInformation.woreda && `Woreda ${additionalInformation.woreda}`,
          additionalInformation.houseNumber && `House ${additionalInformation.houseNumber}`,
        ].filter(Boolean).join(', '),
        additionalInformation,
      ],
    );
    if (!rows[0]) {
      throw new AppError(
        400,
        'INVALID_MEMBERSHIP_TYPE',
        'Membership type is not active',
      );
    }
    response.status(201).json({ success: true, data: rows[0] });
  }),
);

const membershipPage = pageSchema.extend({ membershipTypeId: z.string().uuid().optional() });

function mount(kind: 'expert' | 'membership') {
  const listSchema = kind === 'membership' ? membershipPage : pageSchema;
  const table = kind === 'expert' ? 'expert_applications' : 'membership_applications';
  const path = `/${kind}-applications`;

  adminApplications.get(
    path,
    validate(listSchema, 'query'),
    asyncHandler(async (request, response) => {
      const query: any = request.query;
      const params: any[] = [];
      const conditions: string[] = [];
      if (query.status) {
        params.push(query.status);
        conditions.push(`a.status=$${params.length}`);
      }
      if (query.membershipTypeId && kind === 'membership') {
        params.push(query.membershipTypeId);
        conditions.push(`a.membership_type_id=$${params.length}`);
      }
      if (query.search) {
        params.push(`%${query.search}%`);
        conditions.push(
          `(a.full_name ILIKE $${params.length} OR a.email ILIKE $${params.length}${
            kind === 'expert' ? ` OR a.area_of_expertise ILIKE $${params.length}` : ''
          })`,
        );
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const total = Number(
        (await pool.query(`SELECT count(*) FROM ${table} a ${where}`, params)).rows[0].count,
      );
      params.push(query.limit, (query.page - 1) * query.limit);
      const { rows } = await pool.query(
        `SELECT a.* FROM ${table} a ${where} ORDER BY a.${query.sort} ${query.order}
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );
      listResponse(response, rows, total, query.page, query.limit);
    }),
  );

  adminApplications.get(
    `${path}/:id`,
    validate(id, 'params'),
    asyncHandler(async (request, response) => {
      const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id=$1`, [
        request.params.id,
      ]);
      if (!rows[0]) throw notFound('Application');
      response.json({ success: true, data: rows[0] });
    }),
  );

  adminApplications.patch(
    `${path}/:id/status`,
    validate(id, 'params'),
    validate(
      z.object({
        status: z.enum(['APPROVED', 'REJECTED']),
        reviewNote: z.string().trim().max(5000).optional(),
      }),
    ),
    asyncHandler(async (request, response) => {
      const row = await tx(async (client) => {
        const { rows } = await client.query(
          `UPDATE ${table}
           SET status=$1,review_note=$2,reviewed_by=$3,reviewed_at=now(),updated_at=now()
           WHERE id=$4 RETURNING *`,
          [request.body.status, request.body.reviewNote, request.admin!.id, request.params.id],
        );
        if (!rows[0]) throw notFound('Application');
        await client.query(
          'INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5)',
          [
            request.admin!.id,
            `${kind.toUpperCase()}_APPLICATION_${request.body.status}`,
            `${kind}_application`,
            request.params.id,
            { status: request.body.status },
          ],
        );
        return rows[0];
      });
      response.json({ success: true, data: row });
    }),
  );

  adminApplications.delete(
    `${path}/:id`,
    validate(id, 'params'),
    asyncHandler(async (request, response) => {
      const row = await tx(async (client) => {
        const returning = kind === 'expert' ? 'id,profile_photo_url' : 'id';
        const { rows } = await client.query(
          `DELETE FROM ${table} WHERE id=$1 RETURNING ${returning}`,
          [request.params.id],
        );
        if (!rows[0]) throw notFound('Application');
        await client.query(
          'INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4)',
          [
            request.admin!.id,
            `${kind.toUpperCase()}_APPLICATION_DELETED`,
            `${kind}_application`,
            request.params.id,
          ],
        );
        return rows[0];
      });
      if (kind === 'expert' && row.profile_photo_url) {
        await removeLocal(row.profile_photo_url);
      }
      response.status(204).end();
    }),
  );
}

mount('expert');
mount('membership');
