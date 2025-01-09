import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { formatResponse } from '../utils';
import { NotFoundError, ValidationError } from '../utils/errors';

export class AddressController {
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      res.json(formatResponse(addresses));
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { isDefault, ...addressData } = req.body;

      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: {
          ...addressData,
          userId,
          isDefault: isDefault || false,
        },
      });

      res.status(201).json(formatResponse(address));
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { isDefault, ...addressData } = req.body;

      const existingAddress = await prisma.address.findUnique({
        where: { id: Number(id) },
      });

      if (!existingAddress) {
        throw new NotFoundError('Address not found');
      }

      if (existingAddress.userId !== userId) {
        throw new ValidationError('You can only update your own addresses');
      }

      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId, NOT: { id: Number(id) } },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.update({
        where: { id: Number(id) },
        data: {
          ...addressData,
          isDefault: isDefault || false,
        },
      });

      res.json(formatResponse(address));
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const address = await prisma.address.findUnique({
        where: { id: Number(id) },
      });

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      if (address.userId !== userId) {
        throw new ValidationError('You can only delete your own addresses');
      }

      await prisma.address.delete({
        where: { id: Number(id) },
      });

      res.json(formatResponse({ message: 'Address deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  public setDefault = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const address = await prisma.address.findUnique({
        where: { id: Number(id) },
      });

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      if (address.userId !== userId) {
        throw new ValidationError('You can only set your own addresses as default');
      }

      await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        }),
        prisma.address.update({
          where: { id: Number(id) },
          data: { isDefault: true },
        }),
      ]);

      res.json(formatResponse({ message: 'Address set as default successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
