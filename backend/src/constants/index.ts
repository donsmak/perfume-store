export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const CACHE_KEYS = {
  PRODUCTS: 'products:',
  CATEGORIES: 'categories:',
  USER_PROFILE: 'user:profile:',
  DASHBOARD_STATS: 'admin:dashboard:stats',
} as const;

export const CACHE_TTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 86400,
} as const;
