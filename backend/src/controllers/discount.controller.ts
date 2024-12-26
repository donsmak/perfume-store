import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
const prisma = new PrismaClient();

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
