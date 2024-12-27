import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../services/email.service';
import { NotFoundError, ValidationError } from '../utils/errors';
import { OrderStatus, PaymentMethod } from '../types/order';

const prisma = new PrismaClient();
const emailService = new EmailService();

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
        orderItems: {
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

    const transformedOrders = orders.map((order) => ({
      ...order,
      items: order.orderItems,
    }));

    res.json(transformedOrders);
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { addressId, paymentMethod, items, discountCode } = req.body;

    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user!.id,
      },
    });

    if (!address) {
      throw new NotFoundError('Shipping address not found');
    }

    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      throw new ValidationError('Invalid payment method');
    }

    const order = await prisma.$transaction(async (tx) => {
      const products = await Promise.all(
        items.map(async (item: { productId: number; quantity: number }) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundError(`Product ${item.productId} not found`);
          }

          if (product.stockQuantity < item.quantity) {
            throw new ValidationError(`Insufficient stock for product ${product.nameEn}`);
          }

          return {
            ...product,
            orderedQuantity: item.quantity,
          };
        })
      );

      let subtotal = products.reduce(
        (sum, product) => sum + product.price * product.orderedQuantity,
        0
      );

      let discountAmount = 0;
      let appliedDiscount = null;

      if (discountCode) {
        const discount = await tx.discount.findFirst({
          where: {
            code: discountCode.toUpperCase(),
            isActive: true,
            endDate: { gte: new Date() },
            startDate: { lte: new Date() },
          },
        });

        if (discount) {
          if (subtotal >= (discount.minPurchase || 0)) {
            discountAmount =
              discount.type === 'PERCENTAGE' ? (subtotal * discount.amount) / 100 : discount.amount;
            appliedDiscount = discount;
          }
        }
      }

      const total = subtotal - discountAmount;

      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          addressId,
          paymentMethod,
          status: OrderStatus.PENDING,
          paymentStatus: 'PENDING',
          subtotal,
          discountAmount,
          total,
          discountCode: appliedDiscount?.code,
          orderItems: {
            create: products.map((product) => ({
              productId: product.id,
              quantity: product.orderedQuantity,
              price: product.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
        },
      });

      await Promise.all(
        products.map((product) =>
          tx.product.update({
            where: { id: product.id },
            data: {
              stockQuantity: {
                decrement: product.orderedQuantity,
              },
            },
          })
        )
      );

      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: req.user!.id,
          },
        },
      });

      return newOrder;
    });

    await emailService.sendOrderConfirmation(order, req.user!);

    const paymentDetails =
      paymentMethod === PaymentMethod.BANK_TRANSFER
        ? {
            bankName: process.env.BANK_NAME,
            accountNumber: process.env.BANK_ACCOUNT,
            accountHolder: process.env.BANK_ACCOUNT_HOLDER,
            reference: `ORDER-${order.id}`,
            amount: order.total,
          }
        : null;

    const response = {
      message: 'Order created successfully',
      order: {
        id: order.id,
        reference: `ORDER-${order.id}`,
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentDetails:
          paymentMethod === PaymentMethod.BANK_TRANSFER
            ? {
                bankName: process.env.BANK_NAME,
                accountNumber: process.env.BANK_ACCOUNT,
                accountHolder: process.env.BANK_ACCOUNT_HOLDER,
                reference: `ORDER-${order.id}`,
                amount: order.total,
              }
            : null,
        items: order.orderItems.map((item) => ({
          product: {
            id: item.product.id,
            name: item.product.nameEn,
            price: item.price,
          },
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        shippingAddress: order.shippingAddress,
      },
    };

    res.status(201).json(response);
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
