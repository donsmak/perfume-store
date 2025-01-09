import { redis } from '../lib/redis';
import { logger } from '../utils/logger';

class CacheService {
  async get(key: string): Promise<string | null> {
    try {
      const data = await redis.get(key);
      logger.info(`Cache ${data ? 'hit' : 'miss'} for key: ${key}`);
      return data;
    } catch (error) {
      logger.error(`Error getting cache for key: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    try {
      await redis.set(key, value, 'EX', ttl);
      logger.info(`Cache set for key: ${key}`);
    } catch (error) {
      logger.error(`Error setting cache for key: ${key}`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
      logger.info(`Cache deleted for key: ${key}`);
    } catch (error) {
      logger.error(`Error deleting cache for key: ${key}`, error);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length) {
        await redis.del(...keys);
      }
      logger.info(`Cache deleted for pattern: ${pattern}`);
    } catch (error) {
      logger.error(`Error deleting cache for pattern: ${pattern}`, error);
    }
  }

  async initialize(): Promise<void> {
    try {
      await redis.ping();
      logger.info('Cache service initialized');
    } catch (error) {
      logger.error('Error initializing cache service:', error);
      process.exit(1);
    }
  }
}

export const cacheService = new CacheService();
