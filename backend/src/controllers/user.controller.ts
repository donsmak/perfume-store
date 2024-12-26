import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { cacheService } from '../services/cache.service';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export const getProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        addresses: true,
        orders: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, phone },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await cacheService.getOrSet(
      'admin:dashboard:stats',
      async () => {
        const [userCount, orderCount, productCount, totalRevenue] = await Promise.all([
          prisma.user.count(),
          prisma.order.count(),
          prisma.product.count(),
          prisma.order.aggregate({
            where: { status: 'DELIVERED' },
            _sum: { total: true },
          }),
        ]);

        const recentOrders = await prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        const lowStockProducts = await prisma.product.findMany({
          where: { stockQuantity: { lte: 10 } },
          take: 5,
        });

        res.json({
          stats: {
            userCount,
            orderCount,
            productCount,
            totalRevenue: totalRevenue._sum.total || 0,
          },
          recentOrders,
          lowStockProducts,
        });
      },
      300
    );

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
