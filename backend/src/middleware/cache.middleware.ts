import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import { logger } from '../utils/logger';
import { CACHE_KEYS } from '../constants';

export function cache(duration: number, prefix: string = CACHE_KEYS.PRODUCTS) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${prefix}:${req.originalUrl || req.url}`;

    try {
      const cachedData = await cacheService.get(key);

      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          res.json(parsedData);
          return;
        } catch (error) {
          logger.error('Error parsing cached data', error);
        }
      }

      const originalJson = res.json;
      res.json = function (body) {
        res.json = originalJson;
        cacheService.set(key, JSON.stringify(body), duration);
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      next();
    }
  };
}

export function clearCache(pattern: string): Promise<void> {
  if (!cacheService) {
    logger.error('Cache service is not initialized');
    return Promise.resolve();
  }
  return cacheService.invalidatePattern(pattern);
}
