import { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import { getSession } from 'next-auth/react';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds
const RATE_LIMIT_MAX_REQUESTS = {
  admin: 1000,
  user: 100,
  guest: 10,
};

interface RateLimitConfig {
  window: number;
  maxRequests: number;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
}

export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    const session = await getSession({ req });
    const userRole = session?.user?.role || 'guest';
    const userId = session?.user?.id || req.ip;

    const config: RateLimitConfig = {
      window: RATE_LIMIT_WINDOW,
      maxRequests: RATE_LIMIT_MAX_REQUESTS[userRole as keyof typeof RATE_LIMIT_MAX_REQUESTS],
    };

    const key = `rate-limit:${userId}`;
    const now = Date.now();
    const windowStart = now - config.window * 1000;

    // Get current rate limit info
    const multi = redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zcard(key);
    multi.zadd(key, now, `${now}`);
    multi.expire(key, config.window);
    const [, requestCount] = await multi.exec();

    const currentCount = requestCount as number;
    const remaining = Math.max(0, config.maxRequests - currentCount);
    const reset = Math.ceil((windowStart + config.window * 1000) / 1000);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (currentCount > config.maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: reset,
      });
    }

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    next();
  }
}

export async function getRateLimitInfo(
  userId: string,
  role: string
): Promise<RateLimitInfo> {
  const key = `rate-limit:${userId}`;
  const config = {
    window: RATE_LIMIT_WINDOW,
    maxRequests: RATE_LIMIT_MAX_REQUESTS[role as keyof typeof RATE_LIMIT_MAX_REQUESTS],
  };

  const now = Date.now();
  const windowStart = now - config.window * 1000;

  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart);
  multi.zcard(key);
  const [, requestCount] = await multi.exec();

  const currentCount = requestCount as number;
  const remaining = Math.max(0, config.maxRequests - currentCount);
  const reset = Math.ceil((windowStart + config.window * 1000) / 1000);

  return {
    remaining,
    reset,
    total: config.maxRequests,
  };
}

export async function clearRateLimit(userId: string): Promise<void> {
  const key = `rate-limit:${userId}`;
  await redis.del(key);
}

// Rate limit alert thresholds
const ALERT_THRESHOLDS = {
  warning: 0.8, // 80% of limit
  critical: 0.9, // 90% of limit
};

export async function checkRateLimitAlert(
  userId: string,
  role: string
): Promise<'warning' | 'critical' | null> {
  const info = await getRateLimitInfo(userId, role);
  const usageRatio = 1 - info.remaining / info.total;

  if (usageRatio >= ALERT_THRESHOLDS.critical) {
    return 'critical';
  } else if (usageRatio >= ALERT_THRESHOLDS.warning) {
    return 'warning';
  }

  return null;
}

// Rate limit middleware for specific endpoints
export function createRateLimitMiddleware(
  endpoint: string,
  config: Partial<RateLimitConfig> = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const session = await getSession({ req });
    const userRole = session?.user?.role || 'guest';
    const userId = session?.user?.id || req.ip;

    const endpointKey = `rate-limit:${endpoint}:${userId}`;
    const endpointConfig: RateLimitConfig = {
      window: config.window || RATE_LIMIT_WINDOW,
      maxRequests: config.maxRequests || RATE_LIMIT_MAX_REQUESTS[userRole as keyof typeof RATE_LIMIT_MAX_REQUESTS],
    };

    const now = Date.now();
    const windowStart = now - endpointConfig.window * 1000;

    const multi = redis.multi();
    multi.zremrangebyscore(endpointKey, 0, windowStart);
    multi.zcard(endpointKey);
    multi.zadd(endpointKey, now, `${now}`);
    multi.expire(endpointKey, endpointConfig.window);
    const [, requestCount] = await multi.exec();

    const currentCount = requestCount as number;
    const remaining = Math.max(0, endpointConfig.maxRequests - currentCount);
    const reset = Math.ceil((windowStart + endpointConfig.window * 1000) / 1000);

    res.setHeader('X-RateLimit-Limit', endpointConfig.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (currentCount > endpointConfig.maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${endpoint}`,
        retryAfter: reset,
      });
    }

    next();
  };
} 