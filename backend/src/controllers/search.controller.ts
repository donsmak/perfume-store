import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { ProductFilters } from '../types/product';
import { cacheService } from '../services/cache.service';
import { ValidationError } from '../utils/errors';

const searchService = new SearchService();

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q: query, ...filterParams } = req.query;

    if (!query || typeof query !== 'string') {
      throw new ValidationError('Search query is required');
    }

    const filters: ProductFilters = {
      category: filterParams.category as string,
      brand: filterParams.brand as string,
      minPrice: filterParams.minPrice ? Number(filterParams.minPrice) : undefined,
      maxPrice: filterParams.maxPrice ? Number(filterParams.maxPrice) : undefined,
      featured: filterParams.featured === 'true',
      bestseller: filterParams.bestseller === 'true',
      sort: filterParams.sort as ProductFilters['sort'],
    };

    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;

    const results = await cacheService.getOrSet(
      cacheKey,
      async () => searchService.searchProducts(query, filters),
      1800
    );

    res.json({
      query,
      filters,
      results,
      count: results.length,
    });
  } catch (error) {
    next(error);
  }
};
