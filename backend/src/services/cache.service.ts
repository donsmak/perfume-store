import { Redis } from 'ioredis';
import { initRedis } from '../config/redis.config';
import { logger } from '../utils/logger';

class CacheService {
  private redis: Redis;

  async initialize() {
    try {
      this.redis = await initRedis();
    } catch (error) {
      logger.error('Failed to initialize cache service:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.info(`Cache hit for key: ${key}`);
      } else {
        logger.info(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.setex(key, ttl, stringValue);
      logger.info(`Cache set for key: ${key}`);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async getOrSet<T>(key: string, callback: () => Promise<T>, ttl = 3600): Promise<T> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        logger.info(`Cache hit for key: ${key}`);
        return JSON.parse(cached);
      }

      logger.info(`Cache miss for key: ${key}`);

      const fresh = await callback();
      await this.set(key, fresh, ttl);

      return fresh;
    } catch (error) {
      logger.error(`Cache error for key ${key}:`, error);
      return callback();
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.info(`Cache invalidated for key: ${key}`);
    } catch (error) {
      logger.error(`Cache invalidation error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info(`Cache invalidated for pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Cache pattern invalidation error for ${pattern}:`, error);
    }
  }
}

export const cacheService = new CacheService();
