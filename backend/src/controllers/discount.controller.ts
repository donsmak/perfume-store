import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Discount } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export const getDiscounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const discounts = await prisma.discount.findMany({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        code: true,
        type: true,
        amount: true,
        description: true,
        startDate: true,
        endDate: true,
        minPurchase: true,
        isActive: true,
      },
    });

    res.json(discounts);
  } catch (error) {
    next(error);
  }
};

export const validateDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, cartTotal } = req.body;

    const discount = await prisma.discount.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        endDate: {
          gte: new Date(),
        },
        startDate: {
          lte: new Date(),
        },
      },
    });

    if (!discount) {
      throw new NotFoundError('Invalid discount code');
    }

    const minPurchase = discount.minPurchase ?? 0;

    if (cartTotal < minPurchase) {
      throw new ValidationError(`Minimum purchase amount of ${minPurchase} is required`);
    }

    const discountAmount =
      discount.type === 'PERCENTAGE' ? (cartTotal * discount.amount) / 100 : discount.amount;

    res.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        amount: discount.amount,
        discountAmount: Number(discountAmount.toFixed(2)),
        finalTotal: Number((cartTotal - discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, amount, type, validUntil, minPurchase } = req.body;

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        type,
        amount: Number(amount),
        description: `${type} discount of ${amount}`,
        startDate: new Date(),
        endDate: new Date(validUntil),
        minPurchase: Number(minPurchase),
        isActive: true,
      },
    });

    res.status(201).json(discount);
  } catch (error) {
    next(error);
  }
};
