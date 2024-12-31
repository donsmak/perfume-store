import { Product, Category } from '@prisma/client';
import { CategoryResponse, CategoryListResponse } from '../types/category.types';
import { ProductResponse, ProductListResponse } from '../types/product.types';
import { SuccessResponse } from '../types/common.types';

export const formatCategory = (
  category: Category & { _count?: { products: number } }
): CategoryResponse | null => {
  if (!category) return null;

  return {
    id: Number(category.id),
    name: String(category.name),
    slug: String(category.slug),
    description: String(category.description),
    productsCount: Number(category._count?.products || 0),
    createdAt: new Date(category.createdAt),
    updatedAt: new Date(category.updatedAt),
  };
};

export const formatCategoryList = (
  categories: (Category & { _count?: { products: number } })[]
): CategoryListResponse => ({
  items: categories
    .map((cat) => formatCategory(cat))
    .filter((cat): cat is CategoryResponse => cat !== null),
  total: categories.length,
  page: 1,
  pageSize: categories.length,
});

export const formatProduct = (
  product: Product & {
    category?: { id: number; name: string; slug: string };
  }
): ProductResponse | null => {
  if (!product) return null;

  return {
    id: Number(product.id),
    name: String(product.name),
    slug: String(product.slug),
    brand: String(product.brand),
    description: String(product.description),
    price: Number(product.price),
    volume: String(product.volume),
    stockQuantity: Number(product.stockQuantity),
    isFeatured: Boolean(product.isFeatured),
    isBestseller: Boolean(product.isBestseller),
    image: String(product.image),
    categoryId: Number(product.categoryId),
    category: product.category
      ? {
          id: Number(product.category.id),
          name: String(product.category.name),
          slug: String(product.category.slug),
        }
      : undefined,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  };
};

export const formatProductList = (
  products: (Product & {
    category?: { id: number; name: string; slug: string };
  })[],
  page = 1,
  pageSize = 10,
  total?: number
): ProductListResponse => ({
  items: products
    .map((product) => formatProduct(product))
    .filter((product): product is ProductResponse => product !== null),
  total: total ?? products.length,
  page: Number(page),
  pageSize: Number(pageSize),
});

export const formatResponse = <T>(data: T): SuccessResponse<T> => ({
  status: 'success',
  data,
});
