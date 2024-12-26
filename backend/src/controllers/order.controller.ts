import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
const prisma = new PrismaClient();

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, adminNotes } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status,
        trackingNumber,
        adminNotes,
        updatedAt: new Date(),
      },
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
};
