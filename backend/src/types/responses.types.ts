import { Cart, Review } from '@prisma/client';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type CartResponse = ApiResponse<Cart>;
export type ReviewResponse = ApiResponse<Review>;
export type ReviewListResponse = PaginatedResponse<Review>;
