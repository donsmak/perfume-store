import { Product } from '@prisma/client';

export interface TransformedProduct {
  id: number;
  name: {
    ar?: string | null;
    fr: string;
    en?: string | null;
  };
  description: {
    ar?: string | null;
    fr: string;
    en?: string | null;
  };
  slug: string;
  brand: string;
  price: number;
  stockQuantity: number;
  volume: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  concentration: string | null;
  isFeatured: boolean;
  isBestseller: boolean;
  image: string;
  category?: any;
  averageRating: number | null;
  totalReviews: number;
}

export const transformProduct = (product: Product): TransformedProduct => {
  if (!product.nameFr || !product.descriptionFr) {
    throw new Error('French name and description is required');
  }
  return {
    ...product,
    name: {
      ar: product.nameAr || null,
      fr: product.nameFr,
      en: product.nameEn || null,
    },
    description: {
      ar: product.descriptionAr || null,
      fr: product.descriptionFr,
      en: product.descriptionEn || null,
    },
    topNotes: JSON.parse(product.topNotes),
    middleNotes: JSON.parse(product.middleNotes),
    baseNotes: JSON.parse(product.baseNotes),
  };
};
