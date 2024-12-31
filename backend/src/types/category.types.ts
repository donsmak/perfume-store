import { Category } from '@prisma/client';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  productsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListResponse {
  items: CategoryResponse[];
  total: number;
  page: number;
  pageSize: number;
}
