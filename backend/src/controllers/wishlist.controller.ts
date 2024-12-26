import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export const toggleWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.user!.id,
        productId: Number(productId),
      },
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });
      res.json({ message: 'Remove from wishlist' });
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: req.user!.id,
          productId: Number(productId),
        },
      });
      res.json({ message: 'Added to wishlist' });
    }
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            price: true,
            image: true,
            stockQuantity: true,
            slug: true,
          },
        },
      },
    });
    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};
