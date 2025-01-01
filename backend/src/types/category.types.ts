import { Category } from '@prisma/client';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  productsCount: number;
  totalProducts?: number;
  currentPage?: number;
  pageSize?: number;
  products?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListResponse {
  items: CategoryResponse[];
  total: number;
  page: number;
  pageSize: number;
}
