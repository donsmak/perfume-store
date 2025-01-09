export const ERROR_MESSAGES = {
  PRODUCT: {
    NOT_FOUND: 'Product not found',
    OUT_OF_STOCK: 'Product is out of stock',
    INSUFFICIENT_STOCK: 'Not enough stock available',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    UNAUTHORIZED: 'You are not authorized to perform this action',
  },
  ORDER: {
    EMPTY_CART: 'Cart is empty',
    INVALID_ADDRESS: 'Invalid delivery address',
    PAYMENT_FAILED: 'Payment processing failed',
  },
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
  },
  DATABASE: {
    DUPLICATE_ENTRY: 'A record with this value already exists',
    RECORD_NOT_FOUND: 'The request record was not found',
    FOREIGN_KEY_ERROR: 'Related record does not exist',
    UNEXPECTED_ERROR: 'An unexpected error occurred',
  },
  SERVER: {
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  },
};
