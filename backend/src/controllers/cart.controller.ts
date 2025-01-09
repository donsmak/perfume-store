import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { formatResponse } from '../utils';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ERROR_MESSAGES } from '../constants/errors';
import { logger } from '../utils/logger';
import { CartResponse } from '../types/responses.types';
import { cacheService } from '../services/cache.service';
import { CACHE_KEYS } from '../constants';

export class CartController {
  public getCart = async (
    req: Request,
    res: Response<CartResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['session-id'] as string;

      if (!userId && !sessionId) {
        throw new ValidationError('User ID or session ID is required');
      }

      const cacheKey = userId ? `${CACHE_KEYS.CART}:${userId}` : `${CACHE_KEYS.CART}:${sessionId}`;
      const cachedCart = await cacheService.get(cacheKey);

      if (cachedCart) {
        res.json(formatResponse(JSON.parse(cachedCart)));
        return;
      }

      const cart = await prisma.cart.findUnique({
        where: userId ? { userId } : { sessionId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true,
                  stockQuantity: true,
                },
              },
            },
          },
        },
      });

      if (!cart) {
        const newCart = await prisma.cart.create({
          data: {
            userId,
            sessionId,
            total: 0,
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    stockQuantity: true,
                  },
                },
              },
            },
          },
        });
        await cacheService.set(cacheKey, JSON.stringify(newCart));
        res.json(formatResponse(newCart));
        return;
      }

      await cacheService.set(cacheKey, JSON.stringify(cart));
      res.json(formatResponse(cart));
    } catch (error) {
      next(error);
    }
  };

  public addItem = async (
    req: Request,
    res: Response<CartResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['session-id'] as string;
      const { productId, quantity } = req.body;

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
      }

      if (product.stockQuantity < quantity) {
        throw new ValidationError(ERROR_MESSAGES.PRODUCT.INSUFFICIENT_STOCK);
      }

      let cart = await prisma.cart.findUnique({
        where: userId ? { userId } : { sessionId },
        include: {
          items: true,
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId,
            sessionId,
            total: 0,
          },
          include: {
            items: true,
          },
        });
      }

      const existingItem = cart.items.find((item) => item.productId === productId);

      let updatedCart;
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockQuantity) {
          throw new ValidationError(ERROR_MESSAGES.PRODUCT.INSUFFICIENT_STOCK);
        }

        updatedCart = await prisma.$transaction(async (tx) => {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });

          return await this.recalculateCart(tx, cart.id);
        });
      } else {
        updatedCart = await prisma.$transaction(async (tx) => {
          await tx.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              quantity,
            },
          });

          return await this.recalculateCart(tx, cart.id);
        });
      }

      const cacheKey = userId ? `${CACHE_KEYS.CART}:${userId}` : `${CACHE_KEYS.CART}:${sessionId}`;
      await cacheService.set(cacheKey, JSON.stringify(updatedCart));

      res.status(200).json(formatResponse(updatedCart));
    } catch (error) {
      next(error);
    }
  };

  public updateItem = async (
    req: Request,
    res: Response<CartResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['session-id'] as string;
      const { id } = req.params;
      const { quantity } = req.body;

      const cartItem = await prisma.cartItem.findUnique({
        where: { id: Number(id) },
        include: {
          cart: true,
          product: true,
        },
      });

      if (!cartItem) {
        throw new NotFoundError('Cart item not found');
      }

      if (
        (userId && cartItem.cart.userId !== userId) ||
        (!userId && cartItem.cart.sessionId !== sessionId)
      ) {
        throw new ValidationError('You can only update items in your own cart');
      }

      if (quantity > cartItem.product.stockQuantity) {
        throw new ValidationError(ERROR_MESSAGES.PRODUCT.INSUFFICIENT_STOCK);
      }

      const updatedCart = await prisma.$transaction(async (tx) => {
        await tx.cartItem.update({
          where: { id: Number(id) },
          data: { quantity },
        });

        return await this.recalculateCart(tx, cartItem.cart.id);
      });

      const cacheKey = userId ? `${CACHE_KEYS.CART}:${userId}` : `${CACHE_KEYS.CART}:${sessionId}`;
      await cacheService.set(cacheKey, JSON.stringify(updatedCart));

      res.json(formatResponse(updatedCart));
    } catch (error) {
      next(error);
    }
  };

  public removeItem = async (
    req: Request,
    res: Response<CartResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['session-id'] as string;
      const { id } = req.params;

      const cartItem = await prisma.cartItem.findUnique({
        where: { id: Number(id) },
        include: { cart: true },
      });

      if (!cartItem) {
        throw new NotFoundError('Cart item not found');
      }

      if (
        (userId && cartItem.cart.userId !== userId) ||
        (!userId && cartItem.cart.sessionId !== sessionId)
      ) {
        throw new ValidationError('You can only remove items from your own cart');
      }

      const updatedCart = await prisma.$transaction(async (tx) => {
        await tx.cartItem.delete({
          where: { id: Number(id) },
        });

        return await this.recalculateCart(tx, cartItem.cart.id);
      });

      const cacheKey = userId ? `${CACHE_KEYS.CART}:${userId}` : `${CACHE_KEYS.CART}:${sessionId}`;
      await cacheService.set(cacheKey, JSON.stringify(updatedCart));

      res.json(formatResponse(updatedCart));
    } catch (error) {
      next(error);
    }
  };

  public clearCart = async (
    req: Request,
    res: Response<CartResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['session-id'] as string;

      const cart = await prisma.cart.findUnique({
        where: userId ? { userId } : { sessionId },
      });

      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      await prisma.$transaction([
        prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        }),
        prisma.cart.update({
          where: { id: cart.id },
          data: { total: 0 },
        }),
      ]);

      const cacheKey = userId ? `${CACHE_KEYS.CART}:${userId}` : `${CACHE_KEYS.CART}:${sessionId}`;
      await cacheService.del(cacheKey);

      res.json(formatResponse({ message: 'Cart cleared successfully' }));
    } catch (error) {
      next(error);
    }
  };

  private async recalculateCart(tx: any, cartId: number) {
    const cartItems = await tx.cartItem.findMany({
      where: { cartId },
      include: { product: true },
    });

    const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    return await tx.cart.update({
      where: { id: cartId },
      data: {
        total,
        items: {
          connect: cartItems.map((item) => ({ id: item.id })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
    });
  }
}
