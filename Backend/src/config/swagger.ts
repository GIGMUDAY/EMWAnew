import swaggerJSDoc from 'swagger-jsdoc';
const operations:Record<string,string[]>= {
  '/auth/login':['post'],'/auth/refresh':['post'],'/auth/logout':['post'],'/auth/me':['get'],
  '/public/expert-applications':['post'],'/public/membership-types':['get'],'/public/membership-applications':['post'],'/public/contact-messages':['post'],'/public/resources':['get'],'/public/resources/{id}':['get'],
  '/admin/expert-applications':['get'],'/admin/expert-applications/{id}':['get'],'/admin/expert-applications/{id}/status':['patch'],
  '/admin/membership-applications':['get'],'/admin/membership-applications/{id}':['get'],'/admin/membership-applications/{id}/status':['patch'],
  '/admin/membership-types':['post'],'/admin/membership-types/{id}':['patch','delete'],
  '/admin/contact-messages':['get'],'/admin/contact-messages/{id}':['get'],'/admin/contact-messages/{id}/status':['patch'],
  '/admin/resources':['get','post'],'/admin/resources/{id}':['patch','delete'],
  '/admin/admins':['get','post'],'/admin/admins/{id}':['get','patch'],'/admin/admins/{id}/status':['patch'],
  '/admin/dashboard':['get'],'/admin/audit-logs':['get']
};
const paths=Object.fromEntries(Object.entries(operations).map(([path,methods])=>[path,Object.fromEntries(methods.map(method=>[method,{summary:`${method.toUpperCase()} ${path}`,security:path.startsWith('/admin')||path.endsWith('/me')?[{bearerAuth:[]}]:[],responses:{'200':{description:'Success'},'400':{description:'Validation error'},'401':{description:'Unauthorized'},'403':{description:'Forbidden'}}}]))]));
export const swaggerSpec=swaggerJSDoc({definition:{openapi:'3.0.3',info:{title:'Charity Center Management API',version:'1.0.0',description:'Administrators authenticate; experts and members submit public applications only.'},servers:[{url:'/api/v1'}],paths,components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'JWT'}},schemas:{Error:{type:'object',properties:{success:{type:'boolean',example:false},error:{type:'object'}}}}}},apis:[]});
