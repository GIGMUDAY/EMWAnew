import { Router } from 'express';
import { env } from '../config/env.js';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

export const authRouter = Router();
const authController = new AuthController();

// Publicly exposed Admin Authentication paths
authRouter.post('/login', authController.login);
if (env.NODE_ENV === 'development') {
  authRouter.post('/demo-login', authController.demoLogin);
}
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

// Protected session check path
authRouter.get('/me', authenticateAdmin, authController.getMe);

export default authRouter;
