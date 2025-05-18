import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { AIService } from '@/services/ai';
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
    await limiter.check(res, 20, 'CACHE_TOKEN'); // 20 requests per minute
  } catch {
    return res.status(429).json({ message: 'Rate limit exceeded' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { messageId } = req.body;

  if (!messageId) {
    return res.status(400).json({ message: 'Missing messageId' });
  }

  try {
    const aiService = AIService.getInstance();
    await aiService.processMessage(messageId);

    return res.status(200).json({ message: 'Message processed successfully' });
  } catch (error) {
    console.error('Error processing message:', error);
    return res.status(500).json({ message: 'Error processing message' });
  }
}

export default withMetrics(handler);
