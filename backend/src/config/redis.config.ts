import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export const initRedis = async (): Promise<Redis> => {
  try {
    if (!redisClient) {
      redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

      redisClient.on('connect', () => {
        logger.info('Redis connected');
      });

      redisClient.on('error', (error) => {
        logger.error('Redis connection error', error);
      });

      await redisClient.ping();
    }
    return redisClient;
  } catch (error) {
    logger.error('Redis initialization error', error);
    throw error;
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis not initialized');
  }
  return redisClient;
};
