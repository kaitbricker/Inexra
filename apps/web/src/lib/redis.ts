import { Redis } from 'ioredis';
import { logger } from '@inexra/shared';

class RedisManager {
  private static instance: RedisManager;
  private client: Redis | null = null;

  private constructor() {}

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async connect(): Promise<void> {
    if (this.client) {
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        throw new Error('REDIS_URL is not configured');
      }

      this.client = new Redis(redisUrl, {
        retryStrategy: times => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('error', error => {
        logger.error('Redis connection error:', error);
      });

      this.client.on('connect', () => {
        logger.info('Successfully connected to Redis');
      });

      // Test the connection
      await this.client.ping();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client;
  }

  // Cache methods
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    const result = await this.client.exists(key);
    return result === 1;
  }
}

export const redis = RedisManager.getInstance();

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

export async function setCache<T>(key: string, value: T, expirySeconds = 3600): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', expirySeconds);
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function clearCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Cache middleware for API routes
export function withCache(handler: any, options = { expirySeconds: 3600 }) {
  return async (req: any, res: any) => {
    if (req.method !== 'GET') {
      return handler(req, res);
    }

    const cacheKey = `cache:${req.url}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Store original res.json
    const originalJson = res.json;

    // Override res.json
    res.json = async (data: any) => {
      await setCache(cacheKey, data, options.expirySeconds);
      return originalJson.call(res, data);
    };

    return handler(req, res);
  };
}
