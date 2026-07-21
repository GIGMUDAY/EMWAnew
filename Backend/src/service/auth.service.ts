import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';
import { hashToken, generateTokens } from '../utils/auth.utils.js';
import { env } from '../config/env.js';

export class AuthService {
  private async issueSession(admin: any) {
    const { accessToken, refreshToken } = generateTokens(admin.id, admin.role);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO refresh_tokens (admin_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [admin.id, tokenHash, expiresAt],
    );

    return {
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role,
      },
      accessToken,
      refreshToken,
    };
  }

  public async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [normalizedEmail]);
    const admin = result.rows[0];

    // Security: Generic message protects against account harvesting
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      throw new Error('Invalid email or password configuration.');
    }

    // Security: Immediate block if admin is disabled
    if (!admin.is_active) {
      throw new Error('This administrator account has been deactivated.');
    }

    return this.issueSession(admin);
  }

  public async demoLogin() {
    const { rows } = await pool.query(
      "SELECT * FROM admins WHERE role = 'SUPER_ADMIN' AND is_active = true ORDER BY created_at LIMIT 1",
    );
    if (!rows[0]) throw new Error('No active Super Admin is available for demo login.');
    return this.issueSession(rows[0]);
  }

  public async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    // Erase token instantly to execute secure logout revocation
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  }

  public async refreshSession(oldRefreshToken: string) {
    let payload: any;

    try {
      payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new Error('Invalid or expired refresh token token signature.');
    }

    const oldHash = hashToken(oldRefreshToken);
    const adminId = payload.sub;

    // Verify token exists in the DB store
    const tokenCheck = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND admin_id = $2', 
      [oldHash, adminId]
    );

    if (tokenCheck.rowCount === 0) {
      // SECURITY REPLAY ATTACK DETECTION: Token reuse anomaly found!
      // Wipe out all tokens for this user immediately as a precaution.
      await pool.query('DELETE FROM refresh_tokens WHERE admin_id = $1', [adminId]);
      throw new Error('Security Breach Alert: Token reuse detected. Sessions terminated.');
    }

    // Clear old token from active inventory
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [oldHash]);

    // Enforce active administrator validation check
    const adminResult = await pool.query('SELECT is_active, role FROM admins WHERE id = $1', [adminId]);
    const admin = adminResult.rows[0];

    if (!admin || !admin.is_active) {
      throw new Error('The associated administrator profile is no longer active.');
    }

    // Rotate token family safely
    const tokens = generateTokens(adminId, admin.role);
    const newHash = hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO refresh_tokens (admin_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [adminId, newHash, expiresAt]
    );

    return tokens;
  }
}
