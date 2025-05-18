import { Platform } from '../types/enums';
import { socialMediaConfig } from '../config/socialMedia';
import { logger } from './logger';

interface RateLimitState {
  requests: number;
  resetTime: number;
}

class RateLimiter {
  private states: Map<Platform, RateLimitState> = new Map();

  constructor() {
    // Initialize rate limit states for each platform
    Object.values(Platform).forEach(platform => {
      this.states.set(platform, {
        requests: 0,
        resetTime: Date.now() + 60000, // 1 minute from now
      });
    });
  }

  async checkRateLimit(platform: Platform): Promise<void> {
    const state = this.states.get(platform);
    if (!state) {
      throw new Error(`No rate limit state found for platform: ${platform}`);
    }

    const config = socialMediaConfig[platform];
    const now = Date.now();

    // Reset counter if the time window has passed
    if (now >= state.resetTime) {
      state.requests = 0;
      state.resetTime = now + 60000;
    }

    // Check if we've hit the rate limit
    if (state.requests >= config.rateLimit.requestsPerMinute) {
      const waitTime = state.resetTime - now;
      logger.warn(`Rate limit reached for ${platform}. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      state.requests = 0;
      state.resetTime = Date.now() + 60000;
    }

    state.requests++;
  }

  async withRetry<T>(
    platform: Platform,
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      await this.checkRateLimit(platform);
      return await operation();
    } catch (error) {
      const config = socialMediaConfig[platform];
      
      if (retryCount < config.rateLimit.retryAttempts) {
        logger.warn(
          `Operation failed for ${platform}. Retrying (${retryCount + 1}/${config.rateLimit.retryAttempts})`
        );
        await new Promise(resolve => setTimeout(resolve, config.rateLimit.retryDelay));
        return this.withRetry(platform, operation, retryCount + 1);
      }
      
      throw error;
    }
  }
}

export const rateLimiter = new RateLimiter(); 