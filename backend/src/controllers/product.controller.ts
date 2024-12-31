import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';
import { generateSlug, logger } from '../utils/';
import { formatProduct, formatProductList, formatResponse } from '../utils/formatters';
import { ProductFilters } from '../types/product.types';
import { clearCache } from '../middleware/cache.middleware';
import { CACHE_KEYS } from '../constants';

export class ProductController {
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        brand,
        minPrice,
        maxPrice,
        featured,
        bestseller,
        sort,
      } = req.query;

      const where: any = {};

      if (category) where.category = { slug: category };
      if (brand) where.brand = brand;
      if (minPrice || maxPrice) {
        where.price = {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) }),
        };
      }
      if (featured) where.isFeatured = featured === 'true';
      if (bestseller) where.isBestseller = bestseller === 'true';

      const orderBy: any = {
        ...(sort === 'price_asc' && { price: 'asc' }),
        ...(sort === 'price_desc' && { price: 'desc' }),
        ...(sort === 'newest' && { createdAt: 'desc' }),
      };

      const pageNumber = Number(page) || 1;
      const pageSize = Number(limit) || 10;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      const formattedList = formatProductList(products, pageNumber, pageSize, total);
      res.json(formatResponse(formattedList));
    } catch (error) {
      next(error);
    }
  };

  public getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;

      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const formattedProduct = formatProduct(product);
      res.json(formatResponse(formattedProduct));
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await prisma.product.create({
        data: {
          ...req.body,
          slug: generateSlug(req.body.name),
          price: Number(req.body.price),
          stockQuantity: Number(req.body.stockQuantity),
          categoryId: Number(req.body.categoryId),
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      const formattedProduct = formatProduct(product);
      res.status(201).json(formatResponse(formattedProduct));
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          ...(req.body.name && { slug: generateSlug(req.body.name) }),
          ...(req.body.price && { price: Number(req.body.price) }),
          ...(req.body.stockQuantity && { stockQuantity: Number(req.body.stockQuantity) }),
          ...(req.body.categoryId && { categoryId: Number(req.body.categoryId) }),
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      await clearCache(`${CACHE_KEYS.PRODUCTS}*`);

      const formattedProduct = formatProduct(product);
      res.json(formatResponse(formattedProduct));
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id: Number(id) },
      });

      res.json(formatResponse({ message: 'Product deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
