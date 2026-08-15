import { Router } from 'express';
import { z } from 'zod';
import { pool, tx } from '../db/index.js';
import { asyncHandler, listResponse, pageSchema } from '../utils/http.js';
import { validate } from '../middleware/core.js';
import { AppError, notFound } from '../utils/errors.js';
import { profilePhotoUpload, fileUrl, removeLocal } from '../utils/storage.js';

export const publicContent = Router();
export const adminContent = Router();

const id = z.object({ id: z.string().uuid() });
const email = z.string().email().transform(x => x.trim().toLowerCase());

// --- Hero Slides ---
publicContent.get(
  '/hero-slides',
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT id, image_url as "imageUrl", title, title_am as "titleAm", description, description_am as "descriptionAm", text, text_am as "textAm", signoff, signoff_am as "signoffAm", author, role, role_am as "roleAm", display_order as "displayOrder", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
       FROM hero_slides
       WHERE is_active = true
       ORDER BY display_order ASC, created_at DESC`,
    );
    res.json({ success: true, data: rows });
  }),
);

adminContent.get(
  '/hero-slides',
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT id, image_url as "imageUrl", title, title_am as "titleAm", description, description_am as "descriptionAm", text, text_am as "textAm", signoff, signoff_am as "signoffAm", author, role, role_am as "roleAm", display_order as "displayOrder", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
       FROM hero_slides
       ORDER BY display_order ASC, created_at DESC`,
    );
    res.json({ success: true, data: rows });
  }),
);

const heroSlideSchema = z.object({
  title: z.string().trim().max(255).optional(),
  titleAm: z.string().trim().max(255).optional(),
  description: z.string().trim().max(5000).optional(),
  descriptionAm: z.string().trim().max(5000).optional(),
  text: z.string().trim().min(2).max(5000),
  textAm: z.string().trim().min(2).max(5000),
  signoff: z.string().trim().max(1000).optional(),
  signoffAm: z.string().trim().max(1000).optional(),
  author: z.string().trim().optional().transform((v) => v || 'EMWA'),
  role: z.string().trim().min(2).max(255),
  roleAm: z.string().trim().min(2).max(255),
  displayOrder: z.coerce.number().int().optional(),
  isActive: z.preprocess(
    (val) => {
      if (typeof val === 'string') return val === 'true' || val === 'on' || val === '1';
      if (typeof val === 'boolean') return val;
      return undefined;
    },
    z.boolean().optional(),
  ),
  imageUrl: z.string().trim().optional().transform((v) => (v && v.length > 0 ? v : undefined)),
});

adminContent.post(
  '/hero-slides',
  profilePhotoUpload.single('image'),
  asyncHandler(async (req, res) => {
    const parsed = heroSlideSchema.parse(req.body);
    const imageUrl = req.file ? fileUrl(req, req.file) : parsed.imageUrl;

    if (!imageUrl) {
      if (req.file) await removeLocal(req.file.path);
      throw new AppError(400, 'IMAGE_REQUIRED', 'An image file or imageUrl string is required');
    }

    try {
      const row = await tx(async (client) => {
        const { rows } = await client.query(
          `INSERT INTO hero_slides (
             image_url, title, title_am, description, description_am,
             text, text_am, signoff, signoff_am, author, role, role_am,
             display_order, is_active
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           RETURNING id, image_url as "imageUrl", title, title_am as "titleAm", description, description_am as "descriptionAm", text, text_am as "textAm", signoff, signoff_am as "signoffAm", author, role, role_am as "roleAm", display_order as "displayOrder", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"`,
          [
            imageUrl,
            parsed.title ?? null,
            parsed.titleAm ?? null,
            parsed.description ?? null,
            parsed.descriptionAm ?? null,
            parsed.text,
            parsed.textAm,
            parsed.signoff ?? null,
            parsed.signoffAm ?? null,
            parsed.author,
            parsed.role,
            parsed.roleAm,
            parsed.displayOrder ?? 0,
            parsed.isActive ?? true,
          ],
        );

        await client.query(
          "INSERT INTO audit_logs(administrator_id, action, entity_type, entity_id) VALUES($1, 'HERO_SLIDE_CREATED', 'hero_slide', $2)",
          [req.admin!.id, rows[0].id],
        );

        return rows[0];
      });

      res.status(201).json({ success: true, data: row });
    } catch (error) {
      if (req.file) await removeLocal(req.file.path);
      throw error;
    }
  }),
);

adminContent.patch(
  '/hero-slides/:id',
  validate(id, 'params'),
  profilePhotoUpload.single('image'),
  asyncHandler(async (req, res) => {
    const parsed = heroSlideSchema.partial().parse(req.body);
    const imageUrl = req.file ? fileUrl(req, req.file) : parsed.imageUrl;

    const row = await tx(async (client) => {
      const { rows } = await client.query(
        `UPDATE hero_slides
         SET image_url = COALESCE($1, image_url),
             title = COALESCE($2, title),
             title_am = COALESCE($3, title_am),
             description = COALESCE($4, description),
             description_am = COALESCE($5, description_am),
             text = COALESCE($6, text),
             text_am = COALESCE($7, text_am),
             signoff = COALESCE($8, signoff),
             signoff_am = COALESCE($9, signoff_am),
             author = COALESCE($10, author),
             role = COALESCE($11, role),
             role_am = COALESCE($12, role_am),
             display_order = COALESCE($13, display_order),
             is_active = COALESCE($14, is_active),
             updated_at = now()
         WHERE id = $15
         RETURNING id, image_url as "imageUrl", title, title_am as "titleAm", description, description_am as "descriptionAm", text, text_am as "textAm", signoff, signoff_am as "signoffAm", author, role, role_am as "roleAm", display_order as "displayOrder", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"`,
        [
          imageUrl ?? null,
          parsed.title ?? null,
          parsed.titleAm ?? null,
          parsed.description ?? null,
          parsed.descriptionAm ?? null,
          parsed.text ?? null,
          parsed.textAm ?? null,
          parsed.signoff ?? null,
          parsed.signoffAm ?? null,
          parsed.author ?? null,
          parsed.role ?? null,
          parsed.roleAm ?? null,
          parsed.displayOrder ?? null,
          parsed.isActive ?? null,
          req.params.id,
        ],
      );

      if (!rows[0]) throw notFound('Hero slide');

      await client.query(
        "INSERT INTO audit_logs(administrator_id, action, entity_type, entity_id) VALUES($1, 'HERO_SLIDE_UPDATED', 'hero_slide', $2)",
        [req.admin!.id, req.params.id],
      );

      return rows[0];
    });

    res.json({ success: true, data: row });
  }),
);

adminContent.delete(
  '/hero-slides/:id',
  validate(id, 'params'),
  asyncHandler(async (req, res) => {
    const row = await tx(async (client) => {
      const { rows } = await client.query(
        'DELETE FROM hero_slides WHERE id = $1 RETURNING image_url',
        [req.params.id],
      );
      if (!rows[0]) throw notFound('Hero slide');

      await client.query(
        "INSERT INTO audit_logs(administrator_id, action, entity_type, entity_id) VALUES($1, 'HERO_SLIDE_DELETED', 'hero_slide', $2)",
        [req.admin!.id, req.params.id],
      );

      return rows[0];
    });

    if (row.image_url) {
      await removeLocal(row.image_url);
    }

    res.status(204).end();
  }),
);

// --- Membership Types ---
publicContent.get('/membership-types',asyncHandler(async(_q,res)=>res.json({success:true,data:(await pool.query('SELECT * FROM membership_types WHERE is_active=true ORDER BY name')).rows})));
const mt=z.object({name:z.string().trim().min(2).max(120),description:z.string().trim().min(2).max(10000),requirements:z.string().trim().min(2).max(10000),isActive:z.boolean().optional()});
adminContent.post('/membership-types',validate(mt),asyncHandler(async(req,res)=>{const b=req.body;const row=await tx(async c=>{const {rows}=await c.query('INSERT INTO membership_types(name,description,requirements,is_active) VALUES($1,$2,$3,$4) RETURNING *',[b.name,b.description,b.requirements,b.isActive??true]);await c.query("INSERT INTO audit_logs(administrator_id,action,entity_type,entity_id) VALUES($1,'MEMBERSHIP_TYPE_CREATED','membership_type',$2)",[req.admin!.id,rows[0].id]);return rows[0]});res.status(201).json({success:true,data:row})}));
adminContent.patch('/membership-types/:id',validate(id,'params'),validate(mt.partial()),asyncHandler(async(req,res)=>{const b=req.body,{rows}=await pool.query('UPDATE membership_types SET name=COALESCE($1,name),description=COALESCE($2,description),requirements=COALESCE($3,requirements),is_active=COALESCE($4,is_active),updated_at=now() WHERE id=$5 RETURNING *',[b.name,b.description,b.requirements,b.isActive,req.params.id]);if(!rows[0])throw notFound('Membership type');res.json({success:true,data:rows[0]})}));adminContent.delete('/membership-types/:id',validate(id,'params'),asyncHandler(async(req,res)=>{const {rowCount}=await pool.query('UPDATE membership_types SET is_active=false,updated_at=now() WHERE id=$1',[req.params.id]);if(!rowCount)throw notFound('Membership type');res.status(204).end()}));
const contact=z.object({fullName:z.string().trim().min(2).max(150),email,companyName:z.string().trim().max(200).optional().or(z.literal('')),subject:z.enum(['Membership','Partnership','Media enquiry','Programme collaboration','Other']),message:z.string().trim().min(10).max(10000)});publicContent.post('/contact-messages',validate(contact),asyncHandler(async(req,res)=>{const b=req.body,{rows}=await pool.query('INSERT INTO contact_messages(full_name,email,company_name,subject,message) VALUES($1,$2,$3,$4,$5) RETURNING id,status,created_at',[b.fullName,b.email,b.companyName||null,b.subject,b.message]);res.status(201).json({success:true,data:rows[0]})}));
adminContent.get('/contact-messages',validate(pageSchema,'query'),asyncHandler(async(req,res)=>{const q:any=req.query,p:any[]=[],w:string[]=[];if(q.status){p.push(q.status);w.push(`status=$${p.length}`)}if(q.search){p.push(`%${q.search}%`);w.push(`(full_name ILIKE $${p.length} OR email ILIKE $${p.length} OR subject ILIKE $${p.length})`)}const where=w.length?'WHERE '+w.join(' AND '):'',total=Number((await pool.query(`SELECT count(*) FROM contact_messages ${where}`,p)).rows[0].count);p.push(q.limit,(q.page-1)*q.limit);const rows=(await pool.query(`SELECT * FROM contact_messages ${where} ORDER BY ${q.sort} ${q.order} LIMIT $${p.length-1} OFFSET $${p.length}`,p)).rows;listResponse(res,rows,total,q.page,q.limit)}));adminContent.get('/contact-messages/:id',validate(id,'params'),asyncHandler(async(req,res)=>{const {rows}=await pool.query('SELECT * FROM contact_messages WHERE id=$1',[req.params.id]);if(!rows[0])throw notFound('Message');res.json({success:true,data:rows[0]})}));adminContent.patch('/contact-messages/:id/status',validate(id,'params'),validate(z.object({status:z.enum(['NEW','READ','ARCHIVED'])})),asyncHandler(async(req,res)=>{const {rows}=await pool.query('UPDATE contact_messages SET status=$1,updated_at=now() WHERE id=$2 RETURNING *',[req.body.status,req.params.id]);if(!rows[0])throw notFound('Message');res.json({success:true,data:rows[0]})}));
adminContent.delete('/contact-messages/:id',validate(id,'params'),asyncHandler(async(req,res)=>{const {rowCount}=await pool.query('DELETE FROM contact_messages WHERE id=$1',[req.params.id]);if(!rowCount)throw notFound('Message');res.status(204).end()}));

