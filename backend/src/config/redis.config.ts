import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export const intRedis = () => {
  try {
    redis = new Redis(process.env.REDIS_URL!);

    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    redis.on('error', (error) => {
      logger.error('Redis connection error', error);
    });
  } catch (error) {
    logger.error('Redis initialization error', error);
  }
};

export const getRedisClient = () => {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
};
