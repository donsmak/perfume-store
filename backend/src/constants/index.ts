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
  PRODUCTS: 'products',
  PRODUCT: 'product',
  PRODUCT_REVIEWS: 'product_reviews',
  CART: 'cart',
  CATEGORIES: 'categories',
  CATEGORY: 'category',
  ORDERS: 'orders',
  USER_PROFILE: 'user_profile',
  SEARCH_RESULTS: 'search_results',
};

export const CACHE_TTL = {
  VERY_SHORT: 30,
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 86400,
  VERY_LONG: 604800,
} as const;

export const getCacheKey = {
  productDetails: (slug: string) => `${CACHE_KEYS.PRODUCTS}${slug}`,
  productReviews: (productId: number) => `${CACHE_KEYS.PRODUCT_REVIEWS}${productId}`,
  categoryProducts: (slug: string) => `${CACHE_KEYS.CATEGORIES}${slug}:products`,
  userProfile: (userId: number) => `${CACHE_KEYS.USER_PROFILE}${userId}`,
  searchResults: (query: string) => `${CACHE_KEYS.SEARCH_RESULTS}${query}`,
} as const;
