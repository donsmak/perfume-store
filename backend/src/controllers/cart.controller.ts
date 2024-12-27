import { Request, Response, NextFunction } from 'express';
import { Cart, PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
import { generateGuestId } from '../utils/helpers';

const prisma = new PrismaClient();

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const guestCartId = req.cookies.guestCartId;
    let cart: Cart | null = null;
    if (req.user) {
      cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: req.user!.id,
            items: { create: [] },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }

      if (guestCartId) {
        await mergeGuestCart(guestCartId, req.user.id);
        res.clearCookie('guestCartId');
      }
    } else {
      if (guestCartId) {
        cart = await prisma.cart.findUnique({
          where: { id: guestCartId },
          include: {
            items: {
              include: { product: true },
            },
          },
        });
      }

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            guestId: generateGuestId(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          include: {
            items: {
              include: { product: true },
            },
          },
        });

        res.cookie('guestCartId', cart.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }

  async function mergeGuestCart(guestCartId: string, userId: number): Promise<void> {
    const [guestCart, userCart] = await Promise.all([
      prisma.cart.findUnique({
        where: { id: Number(guestCartId) },
        include: { items: true },
      }),
      prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      }),
    ]);

    if (!userCart) {
      throw new NotFoundError('User cart not found');
    }

    if (guestCart && guestCart.items.length > 0) {
      for (const item of guestCart.items) {
        const existingItem = userCart?.items.find((i) => i.productId === item.productId);

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }
    }

    await prisma.cart.delete({
      where: { id: Number(guestCartId) },
    });
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.stockQuantity < quantity) {
      next(new ValidationError('Insufficient stock'));
      return;
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user!.id,
          items: { create: [] },
        },
        include: {
          items: true,
        },
      });
    }

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    res.status(200).json({ message: 'Product added to cart' });
  } catch (error) {
    next(error);
  }
};

export const getCartTotal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      res.json({ total: 9, itemCount: 0 });
      return;
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    res.json({
      total,
      itemCount: cart.items.length,
      items: cart.items,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: Number(itemId),
        cart: {
          userId: req.user!.id,
        },
      },
    });

    if (!cartItem) {
      next(new NotFoundError('Cart item not found'));
      return;
    }

    await prisma.cartItem.delete({
      where: { id: Number(itemId) },
    });

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};
