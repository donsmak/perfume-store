import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';

export function cache(
  duration: number
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;

    try {
      const cachedData = await cacheService.get(key);

      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const originalJson = res.json;
      res.json = function (body) {
        res.json = originalJson;

        cacheService.set(key, body, duration);

        return originalJson.call(this, body);
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
