import { redis } from './redis';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, number[]>();

  return {
    check: async (res: any, limit: number, token: string) => {
      const tokenCount = tokenCache.get(token) || [0];
      const now = Date.now();
      const windowStart = now - options.interval;

      // Remove old timestamps
      while (tokenCount.length && tokenCount[0] < windowStart) {
        tokenCount.shift();
      }

      // Check if limit is exceeded
      if (tokenCount.length >= limit) {
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader(
          'X-RateLimit-Reset',
          Math.ceil(tokenCount[0] / 1000) + options.interval / 1000
        );
        throw new Error('Rate limit exceeded');
      }

      // Add current timestamp
      tokenCount.push(now);
      tokenCache.set(token, tokenCount);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - tokenCount.length);
      res.setHeader('X-RateLimit-Reset', Math.ceil(now / 1000) + options.interval / 1000);

      // Clean up old tokens
      if (tokenCache.size > options.uniqueTokenPerInterval) {
        const oldestToken = tokenCache.keys().next().value;
        tokenCache.delete(oldestToken);
      }
    },
  };
}
