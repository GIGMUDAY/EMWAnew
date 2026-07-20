import { Response, NextFunction } from 'express';
import type { Request } from 'express';
import { AuthService } from '../service/auth.service.js';

const authService = new AuthService();

export class AuthController {
  public demoLogin = async (_req: Request, res: Response) => {
    try {
      const result = await authService.demoLogin();
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(503).json({
        success: false,
        error: { code: 'DEMO_LOGIN_UNAVAILABLE', message: error.message },
      });
    }
  };

  
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password required.' } });
      }

      const result = await authService.login(email, password);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ status: 'fail', message: 'Refresh token payload required for logout action.' });
      }

      await authService.logout(refreshToken);
      return res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
    } catch (error: any) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ status: 'fail', message: 'Refresh token payload missing.' });
      }

      const tokens = await authService.refreshSession(refreshToken);
      return res.status(200).json({ status: 'success', data: tokens });
    } catch (error: any) {
      return res.status(401).json({ status: 'fail', message: error.message });
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ status: 'success', data: { admin: req.admin } });
  };
}
