import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
const prisma = new PrismaClient();

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: { isDefault: 'desc' },
    });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { street, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
      },
    });
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { street, city, state, postalCode, country, isDefault } = req.body;

    const existingAddress = await prisma.address.findFirst({
      where: { id: Number(id), userId: req.user!.id },
    });

    if (!existingAddress) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: Number(id) },
      data: { street, city, state, postalCode, country, isDefault },
    });

    res.json(address);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: { id: Number(id), userId: req.user!.id },
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    await prisma.address.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
