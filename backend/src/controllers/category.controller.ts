import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';
import { formatCategory, formatCategoryList, formatResponse } from '../utils/formatters';
import { cacheService } from '../services/cache.service';
import { CACHE_KEYS } from '../constants';
import { CategoryListResponse, CategoryResponse } from '../types/category.types';

export class CategoryController {
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { withProducts } = req.query;

      const cacheKey = `${CACHE_KEYS.CATEGORIES}:${withProducts}`;
      const cachedCategories = await cacheService.get(cacheKey);

      if (cachedCategories) {
        res.json(JSON.parse(cachedCategories));
        return;
      }

      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
          ...(withProducts === 'true' && {
            products: {
              take: 4,
            },
          }),
        },
      });

      const formattedList = formatCategoryList(categories);
      const response: CategoryListResponse = {
        items: formattedList,
        total: categories.length,
        page: 1,
        pageSize: categories.length,
      };

      await cacheService.set(cacheKey, JSON.stringify(formatResponse(response)));
      res.json(formatResponse(response));
    } catch (error) {
      next(error);
    }
  };

  public getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const pageNumber = Number(page);
      const pageSize = Number(limit);

      const [category, totalProducts] = await Promise.all([
        prisma.category.findUnique({
          where: { slug },
          include: {
            _count: {
              select: { products: true },
            },
            products: {
              skip: (pageNumber - 1) * pageSize,
              take: pageSize,
            },
          },
        }),
        prisma.product.count({
          where: {
            category: { slug },
          },
        }),
      ]);

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      const formattedCategory = formatCategory({
        ...category,
        totalProducts,
        currentPage: pageNumber,
        pageSize,
      });

      res.json(formatResponse(formattedCategory));
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await prisma.category.create({
        data: req.body,
      });

      await cacheService.delByPattern(`${CACHE_KEYS.CATEGORIES}*`);
      res.status(201).json(formatResponse(category));
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await prisma.category.update({
        where: { id: Number(id) },
        data: req.body,
      });

      await cacheService.delByPattern(`${CACHE_KEYS.CATEGORIES}*`);
      res.json(formatResponse(category));
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.category.delete({
        where: { id: Number(id) },
      });

      await cacheService.delByPattern(`${CACHE_KEYS.CATEGORIES}*`);
      res.json(formatResponse({ message: 'Category successfully deleted' }));
    } catch (error) {
      next(error);
    }
  };
}
