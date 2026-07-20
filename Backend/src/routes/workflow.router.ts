import { Router } from 'express';
import { adminManagement } from '../controllers/admin.controller.js';
import {
  adminApplications,
  publicApplications,
} from '../controllers/applications.controller.js';
import { adminContent, publicContent } from '../controllers/content.controller.js';
import { dashboard } from '../controllers/dashboard.controller.js';
import {
  adminResources,
  publicResources,
} from '../controllers/resources.controller.js';
import { authenticate } from '../middleware/core.js';

const workflowRouter = Router();

// Public workflows: expert applications, membership applications/types,
// contact messages, and published resources.
workflowRouter.use(
  '/public',
  publicApplications,
  publicContent,
  publicResources,
);

// Authenticated administration workflows.
workflowRouter.use(
  '/admin',
  authenticate,
  adminApplications,
  adminContent,
  adminResources,
  dashboard,
  adminManagement,
);

export default workflowRouter;
