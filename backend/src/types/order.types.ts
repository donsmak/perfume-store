import { Order, OrderItem as PrismaOrderItem } from '@prisma/client';

export interface OrderResponse extends Order {
  items: PrismaOrderItem[];
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}
