import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { generateSlug } from '../utils/slug';
import { formatProduct, formatProductList, formatResponse } from '../utils/formatters';
import { cacheService } from '../services/cache.service';
import { CACHE_KEYS } from '../constants';
import { NotFoundError } from '../utils/errors';
import { ProductListResponse, ProductResponse } from '../types/product.types';

export class ProductController {
  public getAll = async (
    req: Request,
    res: Response<ProductListResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, limit, sort, order, minPrice, maxPrice, categoryId, search } = req.query;

      const pageNumber = Number(page) || 1;
      const pageSize = Number(limit) || 10;

      const where: any = {
        ...(minPrice && { price: { gte: Number(minPrice) } }),
        ...(maxPrice && { price: { lte: Number(maxPrice) } }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const orderBy: any = {
        ...(sort === 'name' && { name: order }),
        ...(sort === 'price' && { price: order }),
        ...(sort === 'createdAt' && { createdAt: order }),
        ...(sort === 'updatedAt' && { updatedAt: order }),
      };

      const cacheKey = `${CACHE_KEYS.PRODUCTS}:${JSON.stringify(
        where
      )}:page:${pageNumber}:limit:${pageSize}:sort:${sort}:order:${order}`;
      const cachedProducts = await cacheService.get(cacheKey);

      if (cachedProducts) {
        res.json(JSON.parse(cachedProducts));
        return;
      }

      const [products, total] = await prisma.$transaction([
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
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      const productsWithRating = products.map((product) => ({
        ...product,
        averageRating: product.reviews.length
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
      }));

      const formattedProducts = formatProductList(productsWithRating, {
        page: pageNumber,
        pageSize,
        total,
      });

      await cacheService.set(cacheKey, JSON.stringify(formatResponse(formattedProducts)));
      res.json(formatResponse(formattedProducts));
    } catch (error) {
      next(error);
    }
  };

  public getBySlug = async (
    req: Request,
    res: Response<ProductResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;

      const cacheKey = `${CACHE_KEYS.PRODUCT}:${slug}`;
      const cachedProduct = await cacheService.get(cacheKey);

      if (cachedProduct) {
        res.json(JSON.parse(cachedProduct));
        return;
      }

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
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const productWithRating = {
        ...product,
        averageRating: product.reviews.length
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
      };

      const formattedProduct = formatProduct(productWithRating);
      await cacheService.set(cacheKey, JSON.stringify(formatResponse(formattedProduct)));
      res.json(formatResponse(formattedProduct));
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, price, stockQuantity, categoryId, images, ...rest } = req.body;

      const product = await prisma.product.create({
        data: {
          name,
          slug: generateSlug(name),
          price: Number(price),
          stockQuantity: Number(stockQuantity),
          categoryId: Number(categoryId),
          images: {
            create: images.map((url: string) => ({ url })),
          },
          ...rest,
        },
        include: {
          category: true,
          images: true,
        },
      });

      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCTS}*`);
      res.status(201).json(formatResponse(product));
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, price, stockQuantity, categoryId, images, ...rest } = req.body;

      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name, slug: generateSlug(name) }),
          ...(price && { price: Number(price) }),
          ...(stockQuantity && { stockQuantity: Number(stockQuantity) }),
          ...(categoryId && { categoryId: Number(categoryId) }),
          ...(images && {
            images: {
              deleteMany: {},
              create: images.map((url: string) => ({ url })),
            },
          }),
          ...rest,
        },
        include: {
          category: true,
          images: true,
        },
      });

      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCTS}*`);
      res.json(formatResponse(product));
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

      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCTS}*`);
      res.json(formatResponse({ message: 'Product deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
