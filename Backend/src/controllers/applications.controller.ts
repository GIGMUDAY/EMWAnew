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
    "SELECT id,full_name,professional_title,area_of_expertise AS primary_expertise,location,biography AS professional_biography,profile_photo_url,created_at FROM expert_applications WHERE status='APPROVED' ORDER BY created_at DESC",
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
          (full_name,email,phone_number,professional_title,area_of_expertise,location,biography,profile_photo_url)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)
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

const membershipPage=pageSchema.extend({membershipTypeId:z.string().uuid().optional()});
function mount(kind:'expert'|'membership'){const listSchema=kind==='membership'?membershipPage:pageSchema;const table=kind==='expert'?'expert_applications':'membership_applications',path=`/${kind}-applications`;adminApplications.get(path,validate(listSchema,'query'),asyncHandler(async(req,res)=>{const q:any=req.query,params:any[]=[],where:string[]=[];if(q.status){params.push(q.status);where.push(`a.status=$${params.length}`)}if(q.membershipTypeId&&kind==='membership'){params.push(q.membershipTypeId);where.push(`a.membership_type_id=$${params.length}`)}if(q.search){params.push(`%${q.search}%`);where.push(`(a.full_name ILIKE $${params.length} OR a.email ILIKE $${params.length}${kind==='expert'?` OR a.area_of_expertise ILIKE $${params.length}`:''})`)}const w=where.length?'WHERE '+where.join(' AND '):'';const total=Number((await pool.query(`SELECT count(*) FROM ${table} a ${w}`,params)).rows[0].count);params.push(q.limit,(q.page-1)*q.limit);const {rows}=await pool.query(`SELECT a.* FROM ${table} a ${w} ORDER BY a.${q.sort} ${q.order} LIMIT $${params.length-1} OFFSET $${params.length}`,params);listResponse(res,rows,total,q.page,q.limit)}));adminApplications.get(path+'/:id',validate(id,'params'),asyncHandler(async(req,res)=>{const {rows}=await pool.query(`SELECT * FROM ${table} WHERE id=$1`,[req.params.id]);if(!rows[0])throw notFound('Application');res.json({success:true,data:rows[0]})}));adminApplications.patch(path+'/:id/status',validate(id,'params'),validate(z.object({status:z.enum(['APPROVED','REJECTED']),reviewNote:z.string().trim().max(5000).optional()})),asyncHandler(async(req,res)=>{const row=await tx(async c=>{const {rows}=await c.query(`UPDATE ${table} SET status=$1,review_note=$2,reviewed_by=$3,reviewed_at=now(),updated_at=now() WHERE id=$4 RETURNING *`,[req.body.status,req.body.reviewNote,req.admin!.id,req.params.id]);if(!rows[0])throw notFound('Application');await c.query('INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5)',[req.admin!.id,`${kind.toUpperCase()}_APPLICATION_${req.body.status}`,`${kind}_application`,req.params.id,{status:req.body.status}]);return rows[0]});res.json({success:true,data:row})}))} mount('expert');mount('membership');
