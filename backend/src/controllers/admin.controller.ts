import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { formatResponse } from '../utils';
import { NotFoundError, ValidationError } from '../utils/errors';

export class AdminController {
  public getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;

      const where = search
        ? {
            OR: [
              { email: { contains: search } },
              { firstName: { contains: search } },
              { lastName: { contains: search } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                orders: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json(
        formatResponse({
          users: users.map((user) => ({
            ...user,
            ordersCount: user._count.orders,
            _count: undefined,
          })),
          pagination: {
            total,
            page,
            pageSize: limit,
            pageCount: Math.ceil(total / limit),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  public updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (Number(id) === req.user?.id) {
        throw new ValidationError('Cannot change your own role');
      }

      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: { role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      res.json(formatResponse({ user }));
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (Number(id) === req.user?.id) {
        throw new ValidationError('Cannot delete your own account contact staff.');
      }

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.role === 'ADMIN') {
        throw new ValidationError('Cannot delete admin user');
      }

      await prisma.user.delete({
        where: { id: Number(id) },
      });

      res.json(formatResponse({ message: 'User deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  public getDashBoardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const [totalUsers, totalProducts, totalCategories, recentUsers] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.category.count(),
        prisma.user.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        }),
      ]);

      res.json(
        formatResponse({
          stats: {
            totalUsers,
            totalProducts,
            totalCategories,
          },
          recentUsers,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
