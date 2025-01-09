import { Category, Product } from '@prisma/client';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount?: number;
  totalProducts?: number;
  currentPage?: number;
  pageSize?: number;
  products?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string | null;
  }[];
}

export interface CategoryListResponse {
  items: CategoryResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CategoryWithProductsAndCount extends Category {
  _count: {
    products: number;
  };
  products?: (Product & {
    images?: {
      url: string;
    }[];
  })[];
}
