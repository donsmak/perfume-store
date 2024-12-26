import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { cacheService } from '../services/cache.service';
import { transformProduct } from '../utils/transformers';
import { NotFoundError, ValidationError } from '../utils/errors';
import { generateSlug } from '../utils/helpers';

const prisma = new PrismaClient();

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await cacheService.getOrSet(
      'all_products',
      async () => {
        return prisma.product.findMany({
          include: {
            category: true,
          },
        });
      },
      3600
    );

    const transformedProducts = products.map(transformProduct);

    res.json({ products: transformedProducts });
  } catch (error) {
    next(error);
  }
};

export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, brand, minPrice, maxPrice, featured, bestseller, sort } = req.query;

    const cacheKey = `filtered:${JSON.stringify({
      category,
      brand,
      minPrice,
      maxPrice,
      featured,
      bestseller,
      sort,
    })}`;

    const products = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = {};

        if (category) {
          where.category = {
            slug: category as string,
          };
        }

        if (brand) {
          where.brand = brand as string;
        }

        if (minPrice || maxPrice) {
          where.price = {};
          if (minPrice) where.price.gte = Number(minPrice);
          if (maxPrice) where.price.lte = Number(maxPrice);
        }

        if (featured === 'true') {
          where.isFeatured = true;
        }

        if (bestseller === 'true') {
          where.isBestseller = true;
        }

        let orderBy: any = {};
        if (sort === 'price_asc') {
          orderBy = { price: 'asc' };
        } else if (sort === 'price_desc') {
          orderBy = { price: 'desc' };
        }

        const products = await prisma.product.findMany({
          where,
          orderBy,
          include: {
            category: true,
          },
        });

        return products;
      },
      1800
    );

    const transformedProducts = products.map(transformProduct);

    res.json({ products: transformedProducts });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await cacheService.getOrSet(
      `product:${slug}`,
      async () => {
        return prisma.product.findUnique({
          where: { slug },
          include: {
            category: true,
          },
        });
      },
      3600
    );

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const transformedProduct = transformProduct(product);

    res.json(transformedProduct);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      stockQuantity,
      brand,
      categoryId,
      volume,
      topNotes,
      middleNotes,
      baseNotes,
      concentration,
      isFeatured,
      isBestseller,
      imageUrl,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        nameAr: name.ar,
        nameEn: name.en,
        nameFr: name.fr,
        descriptionAr: description.ar,
        descriptionEn: description.en,
        descriptionFr: description.fr,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        brand,
        categoryId: Number(categoryId),
        volume,
        topNotes: JSON.stringify(Array.isArray(topNotes) ? topNotes : [topNotes]),
        middleNotes: JSON.stringify(Array.isArray(middleNotes) ? middleNotes : [middleNotes]),
        baseNotes: JSON.stringify(Array.isArray(baseNotes) ? baseNotes : [baseNotes]),
        concentration,
        isFeatured: Boolean(isFeatured),
        isBestseller: Boolean(isBestseller),
        image: imageUrl,
        slug: generateSlug(name.ar || name.en || name.fr),
      },
      include: {
        category: true,
      },
    });

    await cacheService.invalidate('products:all');
    await cacheService.invalidate(`categories:${product.categoryId}`);

    res.status(201).json(transformProduct(product));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const productData = { ...req.body };

    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }

    if (productData.stockQuantity) {
      productData.stockQuantity = parseInt(productData.stockQuantity);
    }

    if (productData.categoryId) {
      productData.categoryId = parseInt(productData.categoryId);
    }

    if (req.file) {
      productData.image = `uploads/${req.file.filename}`;
    }

    if (productData.topNotes && !Array.isArray(productData.topNotes)) {
      productData.topNotes = [productData.topNotes];
    }

    if (productData.middleNotes && !Array.isArray(productData.middleNotes)) {
      productData.middleNotes = [productData.middleNotes];
    }

    if (productData.baseNotes && !Array.isArray(productData.baseNotes)) {
      productData.baseNotes = [productData.baseNotes];
    }

    if (productData.name) {
      productData.slug = generateSlug(
        productData.name.ar || productData.name.en || productData.name.fr
      );
    }

    const product = await prisma.product.update({
      where: { id: Number(productId) },
      data: productData,
      include: {
        category: true,
      },
    });

    await Promise.all([
      cacheService.invalidate(`product:${product.slug}`),
      cacheService.invalidate('products:all'),
      cacheService.invalidate(`categories:4{product.categoryId}`),
      cacheService.invalidate(`filtered:*`),
    ]);
    res.json(transformProduct(product));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    
    const product = await prisma.product.delete({
      where: { id: Number(productId) },
    });

    await Promise.all([
      cacheService.invalidate(`product:${product.slug}`),
      cacheService.invalidate('products:all'),
      cacheService.invalidate('categories:all'),
      cacheService.invalidate('filtered:*'),
    ]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
