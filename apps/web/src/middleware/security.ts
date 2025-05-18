import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { rateLimit } from '@/lib/rateLimit';
import { csrf } from '@/lib/csrf';
import { headers } from '@/lib/headers';

export async function withSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Apply security headers
      headers(res);

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

      // Call the handler
      await handler(req, res);
    } catch (error) {
      console.error('Security middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
} 