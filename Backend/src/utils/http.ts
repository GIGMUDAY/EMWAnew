import type {Request,Response,NextFunction,RequestHandler} from 'express'; import {z} from 'zod';
export const asyncHandler=(f:(r:Request,s:Response,n:NextFunction)=>Promise<unknown>):RequestHandler=>(r,s,n)=>void Promise.resolve(f(r,s,n)).catch(n);
export const pageSchema=z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),search:z.string().trim().max(100).optional(),status:z.string().optional(),sort:z.enum(['created_at','updated_at','full_name','email']).default('created_at'),order:z.enum(['asc','desc']).default('desc')});
export const listResponse=(res:Response,rows:unknown[],total:number,page:number,limit:number)=>res.json({success:true,data:rows,meta:{page,limit,total,totalPages:Math.ceil(total/limit)}});
