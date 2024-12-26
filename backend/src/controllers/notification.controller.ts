import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
const prisma = new PrismaClient();

export const subscribeToStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    await prisma.stockNotification.create({
      data: {
        userId: req.user!.id,
        productId: Number(productId),
      },
    });

    res.json({ message: 'Subscribed to stock notifications' });
  } catch (error) {
    next(error);
  }
};

export const toggleStockNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const existingNotification = await prisma.stockNotification.findFirst({
      where: {
        userId: req.user!.id,
        productId: Number(productId),
      },
    });

    if (existingNotification) {
      await prisma.stockNotification.delete({
        where: { id: existingNotification.id },
      });
      res.json({ message: 'Stock notification removed' });
    } else {
      await prisma.stockNotification.create({
        data: {
          userId: req.user!.id,
          productId: Number(productId),
        },
      });
      res.json({ message: 'Stock notification enabled' });
    }
  } catch (error) {
    next(error);
  }
};
