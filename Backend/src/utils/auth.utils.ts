import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_456';

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateTokens = (adminId: string, role: string) => {
  const accessToken = jwt.sign({ sub: adminId, role, type: 'access' }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: adminId, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};
