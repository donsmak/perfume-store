import { Product, User, Address } from '@prisma/client';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  total: number;
  shippingAddressId: number;
  items: OrderItem[];
  user?: User;
  shippingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface CreateOrderRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  shippingAddressId: number;
}

export interface UpdateOrderRequest {
  status: OrderStatus;
}
