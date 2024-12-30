import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';
import {
  createCategoryRequest,
  updateCategoryRequest,
} from '../schemas/validation/category.schema';
import { generateSlug } from '../utils/helpers';
import { validate } from '../middleware/validate.middleware';

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

      res.json({
        status: 'success',
        data: {
          items: categories,
          total: categories.length,
          page: 1,
          pageSize: categories.length,
        },
      });
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

      res.json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new category
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createCategoryRequest.parse({ body: req.body });
      const slug = generateSlug(validatedData.body.name);

      const category = await prisma.category.create({
        data: {
          ...validatedData.body,
          slug,
        },
      });

      res.status(201).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update category
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateCategoryRequest.parse({
        params: req.params,
        body: req.body,
      });

      const category = await prisma.category.update({
        where: { id: validatedData.params.id },
        data: validatedData.body,
      });

      res.json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };
}
