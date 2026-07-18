export class AppError extends Error{constructor(public status:number,public code:string,message:string,public details?:unknown){super(message)}}
export const notFound=(name='Resource')=>new AppError(404,'NOT_FOUND',`${name} not found`);
