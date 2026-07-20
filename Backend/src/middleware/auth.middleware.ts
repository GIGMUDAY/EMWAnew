import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123';

export type AdminAuthRequest = Request;

export const authenticateAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'fail', message: 'Authorization header required.' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as any;
    
    // Security Guardrail: Inline live validation check for account status
    const adminCheck = await pool.query('SELECT id, email, full_name, role, is_active FROM admins WHERE id = $1', [decoded.sub]);
    if (adminCheck.rowCount === 0 || !adminCheck.rows[0].is_active) {
      return res.status(401).json({ status: 'fail', message: 'Session revoked. Admin is inactive.' });
    }

    const admin = adminCheck.rows[0];
    req.admin = { id: admin.id, email: admin.email, fullName: admin.full_name, role: admin.role };
    next();
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Invalid or expired access token.' });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ status: 'fail', message: 'Forbidden: Access level insufficient.' });
    }
    next();
  };
};
