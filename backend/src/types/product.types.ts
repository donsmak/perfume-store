import { Category } from '@prisma/client';

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  brand: string;
  categoryId: number;
  description: string;
  price: number;
  volume: string;
  stockQuantity: number;
  isFeatured: boolean;
  isBestseller: boolean;
  image: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  bestseller?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}
