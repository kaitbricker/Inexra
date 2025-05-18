import Redis from 'ioredis';
import { compress, decompress } from 'lz4-js';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compress?: boolean; // Whether to compress the data
  prefix?: string; // Key prefix
}

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
}

class CacheManager {
  private static instance: CacheManager;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
    memory: 0,
  };

  private constructor() {
    this.updateStats();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async updateStats() {
    try {
      const info = await redis.info();
      const keys = await redis.dbsize();
      const memory = parseInt(info.match(/used_memory_human:(\d+)/)?.[1] || '0');

      this.stats = {
        ...this.stats,
        keys,
        memory,
      };
    } catch (error) {
      console.error('Failed to update cache stats:', error);
    }
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = this.getKey(key, options.prefix);
      const data = await redis.get(fullKey);

      if (!data) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      const parsed = JSON.parse(data);
      return options.compress ? decompress(parsed) : parsed;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const fullKey = this.getKey(key, options.prefix);
      const data = options.compress ? compress(value) : value;
      const serialized = JSON.stringify(data);

      if (options.ttl) {
        await redis.setex(fullKey, options.ttl, serialized);
      } else {
        await redis.set(fullKey, serialized);
      }

      await this.updateStats();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string, prefix?: string): Promise<void> {
    try {
      const fullKey = this.getKey(key, prefix);
      await redis.del(fullKey);
      await this.updateStats();
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(prefix?: string): Promise<void> {
    try {
      if (prefix) {
        const keys = await redis.keys(`${prefix}:*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        await redis.flushdb();
      }
      await this.updateStats();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Cache middleware for API routes
  static createCacheMiddleware(options: CacheOptions = {}) {
    return async (req: any, res: any, next: any) => {
      const cache = CacheManager.getInstance();
      const key = `${req.method}:${req.url}`;

      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      try {
        const cached = await cache.get(key, options);
        if (cached) {
          return res.json(cached);
        }

        // Store original res.json
        const originalJson = res.json;
        res.json = function (data: any) {
          cache.set(key, data, options);
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Export middleware creator
export const createCacheMiddleware = CacheManager.createCacheMiddleware;
