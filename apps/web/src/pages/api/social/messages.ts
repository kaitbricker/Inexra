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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 10, 'CACHE_TOKEN'); // 10 requests per minute
  } catch {
    return res.status(429).json({ message: 'Rate limit exceeded' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { accountId, page = '1', limit = '50' } = req.query;

  if (!accountId) {
    return res.status(400).json({ message: 'Missing accountId' });
  }

  try {
    const socialService = SocialService.getInstance();
    const messages = await socialService.fetchMessages(
      accountId as string,
      parseInt(page as string),
      parseInt(limit as string)
    );

    const conversations = await socialService.groupMessagesIntoConversations(messages);

    return res.status(200).json({
      messages,
      conversations: Array.from(conversations.entries()).map(([key, messages]) => ({
        id: key,
        messages,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: messages.length,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Error fetching messages' });
  }
}

export default withMetrics(handler);
