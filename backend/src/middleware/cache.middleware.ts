import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';

export const getFromCache =
  (cacheKey: string) => async (req: Request, res: Response, next: NextFunction) => {
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    next();
  };

export const clearCache = async (key: string): Promise<void> => {
  await cacheService.del(key);
};

export const clearCacheByPattern = async (pattern: string): Promise<void> => {
  await cacheService.delByPattern(pattern);
};
