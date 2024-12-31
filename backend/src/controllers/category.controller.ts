import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';
import { formatCategory, formatCategoryList, formatResponse } from '../utils';

export class CategoryController {
  /**
   * Get all categories
   */
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
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

      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      const formattedCategory = formatCategory(category);

      res.json(formatResponse(formattedCategory));
    } catch (error) {
      next(error);
    }
  };
}
