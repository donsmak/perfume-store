export const UserRoles = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const OrderStatuses = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type UserRole = keyof typeof UserRoles;
export type OrderStatus = keyof typeof OrderStatuses;
