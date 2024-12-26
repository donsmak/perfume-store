import { Prisma, PrismaClient } from '@prisma/client';
import { ProductFilters, Product } from '../types/product';

const prisma = new PrismaClient();

export class SearchService {
  async searchProducts(query: string, filter?: ProductFilters) {
    const baseQuery: Prisma.ProductFindManyArgs = {
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query } },
              { brand: { contains: query } },
              { description: { contains: query } },
              { topNotes: { contains: query } },
              { middleNotes: { contains: query } },
              { baseNotes: { contains: query } },
            ],
          },

          ...(filter?.category ? [{ categoryId: Number(filter.category) }] : []),
          ...(filter?.brand ? [{ brand: filter.brand }] : []),
          ...(filter?.minPrice ? [{ price: { gte: filter.minPrice } }] : []),
          ...(filter?.maxPrice ? [{ price: { lte: filter.maxPrice } }] : []),
        ],
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    };

    const products = await prisma.product.findMany(baseQuery);

    return products.map((product: any) => ({
      ...product,
      averageRating:
        product.reviews && product.reviews.length > 0
          ? product.reviews.reduce((acc: number, rev: { rating: number }) => acc + rev.rating, 0) /
            product.reviews.length
          : null,
    })) as Product[];
  }
}
