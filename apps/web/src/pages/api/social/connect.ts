import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { SocialService } from '@/services/social';
import { withMetrics } from '@/lib/monitoring';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 5, 'CACHE_TOKEN'); // 5 requests per minute
  } catch {
    return res.status(429).json({ message: 'Rate limit exceeded' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { platform, accessToken, refreshToken, expiresAt } = req.body;

  if (!platform || !accessToken || !refreshToken || !expiresAt) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!['twitter', 'instagram', 'linkedin'].includes(platform)) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  try {
    const socialService = SocialService.getInstance();
    const account = await socialService.connectAccount(
      platform,
      session.user.id,
      accessToken,
      refreshToken,
      new Date(expiresAt)
    );

    return res.status(200).json(account);
  } catch (error) {
    console.error('Error connecting social account:', error);
    return res.status(500).json({ message: 'Error connecting social account' });
  }
}

export default withMetrics(handler);
