import { Category } from '@prisma/client';
import { CategoryResponse, CategoryWithProductsAndCount } from '../types/category.types';

export const formatCategoryList = (
  categories: CategoryWithProductsAndCount[]
): CategoryResponse[] => {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    productCount: category._count.products,
    ...(category.products && {
      products: category.products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0].url : null,
      })),
    }),
  }));
};

export const formatCategory = (
  category: CategoryWithProductsAndCount & {
    totalProducts: number;
    currentPage: number;
    pageSize: number;
  }
): CategoryResponse => {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    totalProducts: category.totalProducts,
    currentPage: category.currentPage,
    pageSize: category.pageSize,
    products:
      category.products?.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0].url : null,
      })) || [],
  };
};

export const formatResponse = <T>(data: T, message: string = 'Success', errors: any = null) => {
  return {
    data,
    message,
    errors,
  };
};
