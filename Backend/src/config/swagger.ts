import swaggerJSDoc from 'swagger-jsdoc';
const operations:Record<string,string[]>= {
  '/auth/login':['post'],'/auth/refresh':['post'],'/auth/logout':['post'],'/auth/me':['get'],
  '/public/experts':['get'],'/public/expert-applications':['post'],'/public/membership-types':['get'],'/public/membership-applications':['post'],'/public/contact-messages':['post'],'/public/newsletter-subscriptions':['post'],'/public/resources':['get'],'/public/resources/{id}':['get'],'/public/updates':['get'],'/public/updates/{slug}':['get'],'/public/events':['get'],'/public/events/{id}':['get'],
  '/admin/expert-applications':['get'],'/admin/expert-applications/{id}':['get'],'/admin/expert-applications/{id}/status':['patch'],
  '/admin/membership-applications':['get'],'/admin/membership-applications/{id}':['get'],'/admin/membership-applications/{id}/status':['patch'],
  '/admin/membership-types':['post'],'/admin/membership-types/{id}':['patch','delete'],
  '/admin/contact-messages':['get'],'/admin/contact-messages/{id}':['get'],'/admin/contact-messages/{id}/status':['patch'],
  '/admin/newsletter-subscribers':['get'],
  '/admin/resources':['get','post'],'/admin/resources/{id}':['patch','delete'],
  '/admin/updates':['get','post'],'/admin/updates/{id}':['get','patch','delete'],
  '/admin/events':['get','post'],'/admin/events/{id}':['get','patch','delete'],
  '/admin/admins':['get','post'],'/admin/admins/{id}':['get','patch'],'/admin/admins/{id}/status':['patch'],
  '/admin/dashboard':['get'],'/admin/audit-logs':['get']
};
const paths: Record<string, Record<string, object>> = Object.fromEntries(
  Object.entries(operations).map(([path, methods]) => [
    path,
    Object.fromEntries(
      methods.map((method) => [
        method,
        {
          summary: `${method.toUpperCase()} ${path}`,
          security: path.startsWith('/admin') || path.endsWith('/me') ? [{ bearerAuth: [] }] : [],
          responses: {
            '200': { description: 'Success' },
            '400': { description: 'Validation error' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' },
          },
        },
      ]),
    ),
  ]),
);

paths['/auth/login']!.post = {
  tags: ['Authentication'],
  summary: 'Log in as an administrator',
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/LoginRequest' },
        example: {
          email: 'admin@example.com',
          password: 'YourPassword123!',
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/LoginResponse' },
        },
      },
    },
    '400': { description: 'Email or password is missing' },
    '401': { description: 'Invalid email or password' },
  },
};

paths['/auth/refresh']!.post = {
  tags: ['Authentication'],
  summary: 'Refresh an administrator session',
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
      },
    },
  },
  responses: {
    '200': { description: 'Tokens rotated successfully' },
    '400': { description: 'Refresh token is missing' },
    '401': { description: 'Refresh token is invalid, expired, or revoked' },
  },
};

paths['/auth/logout']!.post = {
  tags: ['Authentication'],
  summary: 'Log out and revoke a refresh token',
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
      },
    },
  },
  responses: {
    '200': {
      description: 'Logged out successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              message: { type: 'string', example: 'Logged out successfully.' },
            },
          },
        },
      },
    },
    '400': { description: 'Refresh token is missing or invalid' },
  },
};

paths['/admin/admins']!.post = {
  tags: ['Administrator Management'],
  summary: 'Create an administrator (SUPER_ADMIN only)',
  description: 'Regular ADMIN accounts receive HTTP 403. Only a SUPER_ADMIN can create another administrator.',
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/CreateAdminRequest' },
        example: {
          fullName: 'New Administrator',
          email: 'admin@emwa.org',
          password: 'StrongPassword123!',
          role: 'ADMIN',
        },
      },
    },
  },
  responses: {
    '201': { description: 'Administrator created successfully' },
    '400': { description: 'Request validation failed' },
    '401': { description: 'Authentication required' },
    '403': { description: 'Only a SUPER_ADMIN can create administrators' },
    '409': { description: 'An administrator with that email already exists' },
  },
};

const jsonRequest = (schema: object, example?: object) => ({
  required: true,
  content: {
    'application/json': { schema, ...(example ? { example } : {}) },
  },
});

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const paginationParameters = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
  { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
  { name: 'sort', in: 'query', schema: { type: 'string', enum: ['created_at', 'updated_at', 'full_name', 'email'], default: 'created_at' } },
  { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
];

paths['/public/experts']!.get = {
  tags: ['Public Directory'],
  summary: 'List approved expert profiles',
  description: 'Returns public profile fields only. Pending and rejected applications are never exposed.',
  security: [],
  responses: {
    '200': { description: 'Approved expert profiles' },
  },
};

paths['/public/resources']!.get = {
  tags: ['Public Directory'],
  summary: 'List published resources',
  description: 'Returns resources where is_published is true.',
  security: [],
  responses: {
    '200': { description: 'Published resources' },
  },
};

paths['/public/newsletter-subscriptions']!.post = {
  tags: ['Public Workflows'],
  summary: 'Subscribe an email address to The Narrative Shift',
  description: 'Creates or reactivates a newsletter subscription. Email addresses are normalized and never duplicated.',
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', maxLength: 320 },
          },
        },
        example: { email: 'reader@example.com' },
      },
    },
  },
  responses: {
    '201': { description: 'Subscription confirmed' },
    '400': { description: 'Invalid email address' },
    '429': { description: 'Too many requests' },
  },
};

paths['/admin/newsletter-subscribers']!.get = {
  tags: ['Admin Workflows'],
  summary: 'List newsletter subscribers',
  description: 'Returns paginated newsletter subscribers from PostgreSQL with optional status and email filters.',
  security: [{ bearerAuth: [] }],
  parameters: [
    ...paginationParameters,
    { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
    {
      name: 'status',
      in: 'query',
      schema: { type: 'string', enum: ['ACTIVE', 'UNSUBSCRIBED'] },
    },
  ],
  responses: {
    '200': { description: 'Paginated newsletter subscribers' },
    '401': { description: 'Authentication required' },
  },
};

const publishingListParameters = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
  { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
  { name: 'type', in: 'query', schema: { type: 'string' } },
  { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
];
const updateFormSchema = {
  type: 'object',
  required: ['title', 'excerpt', 'content', 'contentType', 'authorName'],
  properties: {
    title: { type: 'string', example: 'Regional newsrooms welcome new leadership cohort' },
    slug: { type: 'string', example: 'regional-newsrooms-leadership-cohort' },
    excerpt: { type: 'string', example: 'Editors from across Ethiopia begin a six-month leadership program.' },
    content: { type: 'string', example: 'The full article content goes here. Separate paragraphs with blank lines.' },
    contentType: { type: 'string', enum: ['NEWS', 'PRESS', 'ARTICLE', 'PHOTO', 'VIDEO'] },
    videoUrl: { type: 'string', format: 'uri' },
    authorName: { type: 'string', example: 'EMWA Editorial Desk' },
    status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
    isFeatured: { type: 'boolean', default: false },
    featuredImage: { type: 'string', format: 'binary' },
  },
};
const eventFormSchema = {
  type: 'object',
  required: ['title', 'description', 'eventType', 'location', 'startsAt'],
  properties: {
    title: { type: 'string', example: 'Regional Chapter Convening' },
    slug: { type: 'string', example: 'regional-chapter-convening' },
    description: { type: 'string', example: 'A gathering for members and regional media leaders.' },
    eventType: { type: 'string', example: 'Convening' },
    location: { type: 'string', example: 'Hawassa University' },
    startsAt: { type: 'string', format: 'date-time' },
    endsAt: { type: 'string', format: 'date-time' },
    registrationUrl: { type: 'string', format: 'uri' },
    capacityStatus: { type: 'string', enum: ['AVAILABLE', 'AT_CAPACITY', 'CANCELLED'] },
    status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
    featuredImage: { type: 'string', format: 'binary' },
  },
};

paths['/public/updates']!.get = { tags: ['Public Publishing'], summary: 'List published updates', security: [], parameters: [...publishingListParameters, { name: 'featured', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'Published updates' }, '400': { description: 'Invalid filters' } } };
paths['/public/updates/{slug}']!.get = { tags: ['Public Publishing'], summary: 'Read a published update by slug', security: [], parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Complete article' }, '404': { description: 'Article not found' } } };
paths['/public/events']!.get = { tags: ['Public Publishing'], summary: 'List published events', security: [], parameters: publishingListParameters, responses: { '200': { description: 'Published events' } } };
paths['/public/events/{id}']!.get = { tags: ['Public Publishing'], summary: 'Get a published event', security: [], parameters: [idParameter], responses: { '200': { description: 'Event details' }, '404': { description: 'Event not found' } } };

for (const resource of ['updates', 'events'] as const) {
  paths[`/admin/${resource}`]!.get = { tags: ['Admin Publishing'], summary: `List all ${resource}`, security: [{ bearerAuth: [] }], parameters: [...publishingListParameters, { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] } }], responses: { '200': { description: `Paginated ${resource}` }, '401': { description: 'Authentication required' } } };
  paths[`/admin/${resource}`]!.post = { tags: ['Admin Publishing'], summary: `Create ${resource === 'updates' ? 'an update' : 'an event'}`, security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'multipart/form-data': { schema: resource === 'updates' ? updateFormSchema : eventFormSchema } } }, responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' }, '401': { description: 'Authentication required' } } };
  paths[`/admin/${resource}/{id}`]!.get = { tags: ['Admin Publishing'], summary: `Get ${resource.slice(0, -1)} by ID`, security: [{ bearerAuth: [] }], parameters: [idParameter], responses: { '200': { description: 'Details' }, '404': { description: 'Not found' } } };
  paths[`/admin/${resource}/{id}`]!.patch = { tags: ['Admin Publishing'], summary: `Edit, publish, or archive ${resource.slice(0, -1)}`, security: [{ bearerAuth: [] }], parameters: [idParameter], requestBody: { required: true, content: { 'multipart/form-data': { schema: resource === 'updates' ? updateFormSchema : eventFormSchema } } }, responses: { '200': { description: 'Updated' }, '400': { description: 'Validation error' }, '404': { description: 'Not found' } } };
  paths[`/admin/${resource}/{id}`]!.delete = { tags: ['Admin Publishing'], summary: `Delete ${resource.slice(0, -1)}`, security: [{ bearerAuth: [] }], parameters: [idParameter], responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found' } } };
}

paths['/admin/expert-applications']!.get = {
  tags: ['Admin Workflows'],
  summary: 'List all expert applications',
  security: [{ bearerAuth: [] }],
  parameters: [
    ...paginationParameters,
    { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] } },
  ],
  responses: {
    '200': { description: 'Paginated expert applications' },
    '401': { description: 'Authentication required' },
  },
};

paths['/admin/membership-applications']!.get = {
  tags: ['Admin Workflows'],
  summary: 'List membership applications by type or status',
  security: [{ bearerAuth: [] }],
  parameters: [
    ...paginationParameters,
    { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] } },
    { name: 'membershipTypeId', in: 'query', schema: { type: 'string', format: 'uuid' } },
  ],
  responses: {
    '200': { description: 'Paginated membership applications' },
    '401': { description: 'Authentication required' },
  },
};

paths['/admin/resources']!.get = {
  tags: ['Admin Workflows'],
  summary: 'List all resources, including unpublished resources',
  security: [{ bearerAuth: [] }],
  parameters: paginationParameters,
  responses: {
    '200': { description: 'Paginated resources' },
    '401': { description: 'Authentication required' },
  },
};

paths['/admin/contact-messages']!.get = {
  tags: ['Admin Workflows'],
  summary: 'List all contact messages',
  description: 'Returns paginated contact messages with optional status and text filters.',
  security: [{ bearerAuth: [] }],
  parameters: [
    ...paginationParameters,
    {
      name: 'status',
      in: 'query',
      schema: { type: 'string', enum: ['NEW', 'READ', 'ARCHIVED'] },
    },
  ],
  responses: {
    '200': { description: 'Paginated contact messages' },
    '401': { description: 'Authentication required' },
  },
};

paths['/admin/contact-messages/{id}']!.get = {
  tags: ['Admin Workflows'],
  summary: 'Get a contact message by ID',
  security: [{ bearerAuth: [] }],
  parameters: [idParameter],
  responses: {
    '200': { description: 'Contact message details' },
    '400': { description: 'Invalid UUID' },
    '401': { description: 'Authentication required' },
    '404': { description: 'Contact message not found' },
  },
};

paths['/public/expert-applications']!.post = {
  tags: ['Public Workflows'],
  summary: 'Submit an expert application',
  security: [],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: { $ref: '#/components/schemas/ExpertApplicationRequest' },
      },
    },
  },
  responses: {
    '201': { description: 'Expert application submitted' },
    '400': { description: 'Request validation failed' },
  },
};

paths['/public/membership-applications']!.post = {
  tags: ['Public Workflows'],
  summary: 'Submit a membership application',
  security: [],
  requestBody: jsonRequest(
    { $ref: '#/components/schemas/MembershipApplicationRequest' },
    {
      membershipTypeId: '00000000-0000-4000-8000-000000000001',
      fullName: 'John Member',
      email: 'john@example.com',
      phone: '+251911111111',
      outletOrInstitution: 'Addis Media Institute',
      currentRole: 'Journalism student',
      regionOrChapter: 'Addis Ababa',
      additionalInformation: {},
    },
  ),
  responses: {
    '201': { description: 'Membership application submitted' },
    '400': { description: 'Invalid or inactive membership type, or invalid request' },
  },
};

paths['/public/contact-messages']!.post = {
  tags: ['Public Workflows'],
  summary: 'Submit a contact message',
  security: [],
  requestBody: jsonRequest(
    { $ref: '#/components/schemas/ContactMessageRequest' },
    {
      fullName: 'Mary Visitor',
      email: 'mary@example.com',
      companyName: 'Horn Media Network',
      subject: 'Partnership',
      message: 'I would like to discuss a possible partnership with your organization.',
    },
  ),
  responses: {
    '201': { description: 'Contact message submitted' },
    '400': { description: 'Request validation failed' },
  },
};

paths['/admin/membership-types']!.post = {
  tags: ['Admin Workflows'],
  summary: 'Create a membership type',
  security: [{ bearerAuth: [] }],
  requestBody: jsonRequest({ $ref: '#/components/schemas/MembershipTypeRequest' }),
  responses: {
    '201': { description: 'Membership type created' },
    '400': { description: 'Request validation failed' },
    '401': { description: 'Authentication required' },
  },
};

for (const applicationKind of ['expert', 'membership']) {
  const path = `/admin/${applicationKind}-applications/{id}/status`;
  paths[path]!.patch = {
    tags: ['Admin Workflows'],
    summary: `Approve or reject a ${applicationKind} application`,
    security: [{ bearerAuth: [] }],
    parameters: [idParameter],
    requestBody: jsonRequest(
      { $ref: '#/components/schemas/ApplicationReviewRequest' },
      { status: 'APPROVED', reviewNote: 'Application meets the requirements.' },
    ),
    responses: {
      '200': { description: 'Application status updated' },
      '400': { description: 'Request validation failed' },
      '401': { description: 'Authentication required' },
      '404': { description: 'Application not found' },
    },
  };
}

paths['/admin/resources']!.post = {
  tags: ['Admin Workflows'],
  summary: 'Upload a resource',
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['title', 'description', 'category', 'file'],
          properties: {
            title: { type: 'string', example: 'Community Guide' },
            description: { type: 'string', example: 'A practical community resource guide.' },
            category: { type: 'string', example: 'Guides' },
            file: { type: 'string', format: 'binary' },
          },
        },
      },
    },
  },
  responses: {
    '201': { description: 'Resource uploaded' },
    '400': { description: 'File or required metadata is missing' },
    '401': { description: 'Authentication required' },
  },
};

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Charity Center Management API',
      version: '1.0.0',
      description: 'Administrators authenticate; experts and members submit public applications only.',
    },
    servers: [{ url: '/api/v1' }],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', format: 'password', example: 'YourPassword123!' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                admin: { type: 'object' },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token returned by POST /auth/login',
              example: 'paste-your-refresh-token-here',
            },
          },
        },
        CreateAdminRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', minLength: 2, maxLength: 150, example: 'New Administrator' },
            email: { type: 'string', format: 'email', example: 'admin@emwa.org' },
            password: {
              type: 'string',
              format: 'password',
              minLength: 12,
              maxLength: 128,
              description: 'Must contain uppercase, lowercase, number, and special characters.',
              example: 'StrongPassword123!',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'SUPER_ADMIN'],
              default: 'ADMIN',
            },
          },
        },
        ExpertApplicationRequest: {
          type: 'object',
          required: [
            'fullName',
            'professionalTitle',
            'primaryExpertise',
            'location',
            'professionalBiography',
            'email',
          ],
          properties: {
            fullName: { type: 'string', minLength: 2, maxLength: 150, example: 'Hana Bekele' },
            professionalTitle: {
              type: 'string',
              minLength: 2,
              maxLength: 150,
              example: 'Investigative reporter',
            },
            primaryExpertise: {
              type: 'string',
              enum: ['Journalism', 'Broadcasting', 'Digital', 'Advocacy', 'Academic', 'Film'],
              example: 'Journalism',
            },
            location: { type: 'string', minLength: 2, maxLength: 150, example: 'Addis Ababa' },
            professionalBiography: {
              type: 'string',
              minLength: 20,
              maxLength: 10000,
              example: 'Investigative journalist covering governance, community issues, and women in media.',
            },
            email: { type: 'string', format: 'email', example: 'hana@example.com' },
            phone: { type: 'string', minLength: 5, maxLength: 40, example: '+251911234567' },
            profilePhoto: {
              type: 'string',
              format: 'binary',
              description: 'Optional JPG or PNG profile photo.',
            },
          },
        },
        MembershipApplicationRequest: {
          type: 'object',
          required: [
            'membershipTypeId',
            'fullName',
            'email',
            'phone',
            'outletOrInstitution',
            'currentRole',
            'regionOrChapter',
          ],
          properties: {
            membershipTypeId: { type: 'string', format: 'uuid' },
            fullName: { type: 'string', minLength: 2, maxLength: 150 },
            email: { type: 'string', format: 'email' },
            companyName: { type: 'string', maxLength: 200, example: 'Horn Media Network' },
            phone: { type: 'string', minLength: 5, maxLength: 40 },
            outletOrInstitution: {
              type: 'string',
              minLength: 2,
              maxLength: 200,
              example: 'Addis Media Institute',
            },
            currentRole: {
              type: 'string',
              minLength: 2,
              maxLength: 150,
              example: 'Journalism student',
            },
            regionOrChapter: {
              type: 'string',
              minLength: 2,
              maxLength: 150,
              example: 'Addis Ababa',
            },
            additionalInformation: { type: 'object', additionalProperties: true, default: {} },
          },
        },
        ContactMessageRequest: {
          type: 'object',
          required: ['fullName', 'email', 'subject', 'message'],
          properties: {
            fullName: { type: 'string', minLength: 2, maxLength: 150 },
            email: { type: 'string', format: 'email' },
            subject: {
              type: 'string',
              enum: [
                'Membership',
                'Partnership',
                'Media enquiry',
                'Programme collaboration',
                'Other',
              ],
              example: 'Partnership',
            },
            message: { type: 'string', minLength: 10, maxLength: 10000 },
          },
        },
        MembershipTypeRequest: {
          type: 'object',
          required: ['name', 'description', 'requirements'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 120 },
            description: { type: 'string', minLength: 2, maxLength: 10000 },
            requirements: { type: 'string', minLength: 2, maxLength: 10000 },
            isActive: { type: 'boolean', default: true },
          },
        },
        ApplicationReviewRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
            reviewNote: { type: 'string', maxLength: 5000 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'object' },
          },
        },
      },
    },
  },
  apis: [],
});
