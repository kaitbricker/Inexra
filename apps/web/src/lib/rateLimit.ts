import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from './redis';

const WINDOW_SIZE = 60; // 1 minute
const MAX_REQUESTS = 100; // requests per minute

export async function rateLimit(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate_limit:${ip}`;

  try {
    const requests = await redis.incr(key);
    if (requests === 1) {
      await redis.expire(key, WINDOW_SIZE);
    }

    if (requests > MAX_REQUESTS) {
      res.setHeader('Retry-After', WINDOW_SIZE);
      throw new Error('Too many requests');
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - requests));
    res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + WINDOW_SIZE);
  } catch (error) {
    if (error.message === 'Too many requests') {
      res.status(429).json({ error: 'Too many requests' });
    } else {
      console.error('Rate limit error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    throw error;
  }
}
