import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';
import { formatCategory, formatCategoryList, formatResponse } from '../utils';
import { clearCache } from '../middleware/cache.middleware';
import { CACHE_KEYS } from '../constants';

export class CategoryController {
  /**
   * Get all categories
   * With optional product count and filters
   */
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { withProducts, featured } = req.query;

      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
          ...(withProducts === 'true' && {
            products: {
              take: 4,
              where: {
                ...(featured === 'true' && { isFeatured: true }),
              },
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                image: true,
              },
            },
          }),
        },
      });

      const formattedList = formatCategoryList(categories);
      res.json(formatResponse(formattedList));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get category by slug
   */
  public getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const { page = 1, limit = 10, sort } = req.query;

      const pageNumber = Number(page);
      const pageSize = Number(limit);

      const orderBy: any = {
        ...(sort === 'price_asc' && { price: 'asc' }),
        ...(sort === 'price_desc' && { price: 'desc' }),
        ...(sort === 'newest' && { createdAt: 'desc' }),
      };

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
              orderBy,
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

      await clearCache(`${CACHE_KEYS.CATEGORIES}*`);
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

      await clearCache(`${CACHE_KEYS.CATEGORIES}*`);
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

      await clearCache(`${CACHE_KEYS.CATEGORIES}*`);

      res.json(formatResponse({ message: 'Category successfully deleted' }));
    } catch (error) {
      next(error);
    }
  };
}
