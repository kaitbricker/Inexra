import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { securityConfig } from '../config/security';
import { verifyMFAToken } from '../utils/mfa';
import { rateLimit } from '../lib/rateLimit';
import { csrf } from '../lib/csrf';

export async function withSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Apply security headers
      Object.entries(securityConfig.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Check CSRF token for non-GET requests
      if (req.method !== 'GET') {
        await csrf(req, res);
      }

      // Apply rate limiting
      await rateLimit(req, res);

      // Check authentication
      const session = await getSession({ req });
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check MFA if enabled
      if (session.user.mfaEnabled) {
        const mfaToken = req.headers['x-mfa-token'];
        if (!mfaToken || typeof mfaToken !== 'string') {
          return res.status(401).json({ error: 'MFA token required' });
        }

        const isValid = await verifyMFAToken(session.user.id, mfaToken);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid MFA token' });
        }
      }

      // Add security-related headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

      // Call the handler
      await handler(req, res);
    } catch (error) {
      console.error('Security middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
