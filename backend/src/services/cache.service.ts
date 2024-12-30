import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { getRedisClient } from '../config/redis.config';

const redis = new Redis(process.env.REDIS_URL!);

redis.on('error', (error) => {
  logger.error('Redis connection error', error);
});

export class CacheService {
  async get(key: string): Promise<string | null> {
    try {
      const value = await redis.get(key);
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

  async set(key: string, value: string, ttl: 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, value);
      logger.info(`Cache set for key: ${key}`);
    } catch (error) {
      logger.error(`Cache set error for key ${key}`, error);
    }
  }
  async getOrSet<T>(key: string, callback: () => Promise<T>, ttl = 3600): Promise<T> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.info(`Cache hit for key: ${key}`);
        return JSON.parse(cached);
      }

      logger.info(`Cache miss for key: ${key}`);

      const fresh = await callback();
      await redis.setex(key, ttl, JSON.stringify(fresh));

      return fresh;
    } catch (error) {
      logger.error(`Cache error for key ${key}:`, error);
      return callback();
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await redis.del(key);
      logger.info(`Cache invalidated for key: ${key}`);
    } catch (error) {
      logger.error(`Cache invalidation error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Cache invalidated for pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Cache pattern invalidation error for ${pattern}`, error);
    }
  }
}

export const cacheService = new CacheService();
