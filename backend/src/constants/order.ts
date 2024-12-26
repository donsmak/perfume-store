export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const PaymentMethod = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  IN_STORE: 'IN_STORE',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
