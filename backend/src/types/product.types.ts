import { Category, Review } from '@prisma/client';

export interface Product {
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
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  category?: Category;
  reviews?: Array<{ rating: number }>;
  averageRating?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  bestseller?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
  notes?: string[];
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}
