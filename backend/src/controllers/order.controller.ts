import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { formatResponse } from '../utils';
import { ValidationError } from '../utils/errors';
import { clearCache } from '../middleware/cache.middleware';
import { CACHE_KEYS } from '../constants';
import { CreateOrderRequest } from '../schemas/order.schema';
import { OrderItem } from '../types/order.types';

export class OrderController {
  public createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { shippingAddress, paymentMethod, bankTransferDetails, totalAmount } =
        req.body as CreateOrderRequest['body'];

      // Validate payment method and details
      if (paymentMethod === 'BANK_TRANSFER' && !bankTransferDetails) {
        throw new ValidationError('Bank transfer details are required');
      }

      // Get the user's cart
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new ValidationError('Cart is empty');
      }

      // Validate total amount
      const cartTotal = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      if (cartTotal !== totalAmount) {
        throw new ValidationError('Total amount does not match cart total');
      }

      // Create order items
      const orderItems: OrderItem[] = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Start a transaction
      const order = await prisma.$transaction(async (prisma) => {
        // Create or connect the shipping address
        let shippingAddressId: number;

        // Explicitly check if shippingAddress has an id property
        if ('id' in shippingAddress) {
          // Connect to existing address
          const existingAddress = await prisma.address.findUnique({
            where: { id: shippingAddress.id },
          });

          if (!existingAddress) {
            throw new ValidationError(`Address with ID ${shippingAddress.id} not found`);
          }

          shippingAddressId = existingAddress.id;
        } else {
          // Create new address
          const newAddress = await prisma.address.create({
            data: {
              userId,
              ...shippingAddress,
            },
          });
          shippingAddressId = newAddress.id;
        }

        // Create the order
        const createdOrder = await prisma.order.create({
          data: {
            userId,
            shippingAddressId,
            paymentMethod,
            ...(paymentMethod === 'BANK_TRANSFER' &&
              bankTransferDetails && {
                bankTransferDetails: {
                  create: bankTransferDetails,
                },
              }),
            totalAmount,
            items: {
              create: orderItems.map((item) => ({
                quantity: item.quantity,
                price: item.price,
                productId: item.productId,
              })),
            },
          },
          include: {
            shippingAddress: true,
            items: {
              include: {
                product: true,
              },
            },
            bankTransferDetails: true,
          },
        });

        // Update product stock quantities
        for (const item of cart.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }

        // Clear the user's cart
        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: {
              deleteMany: {},
            },
          },
        });

        return createdOrder;
      });

      // Invalidate cache
      await clearCache(CACHE_KEYS.CART);

      res.status(201).json(formatResponse(order));
    } catch (error) {
      next(error);
    }
  };

  public getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          shippingAddress: true,
          items: {
            include: {
              product: true,
            },
          },
          bankTransferDetails: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(formatResponse(orders));
    } catch (error) {
      next(error);
    }
  };

  public getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
          shippingAddress: true,
          items: {
            include: {
              product: true,
            },
          },
          bankTransferDetails: true,
        },
      });

      if (!order) {
        throw new ValidationError('Order not found');
      }

      if (order.userId !== userId) {
        throw new ValidationError('You are not authorized to view this order');
      }

      res.json(formatResponse(order));
    } catch (error) {
      next(error);
    }
  };
}
