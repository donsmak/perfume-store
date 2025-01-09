import { Product } from '@prisma/client';

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isFeatured: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  averageRating: number;
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
