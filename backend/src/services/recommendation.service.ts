import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RecommendationService {
  async getPersonalizedRecommendations(userId: number) {
    const userHistory = await prisma.orderItem.findMany({
      where: {
        order: {
          userId: userId,
          status: 'DELIVERED',
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    const userInterests = await prisma.$transaction([
      prisma.wishlistItem.findMany({
        where: { userId },
        select: { productId: true },
      }),
      prisma.cartItem.findMany({
        where: {
          cart: { userId },
        },
        select: { productId: true },
      }),
    ]);

    const preferredCategories = new Set(userHistory.map((item) => item.product.categoryId));
    const preferredBrands = new Set(userHistory.map((item) => item.product.brand));

    const recommendations = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: { in: Array.from(preferredCategories) } },
          { brand: { in: Array.from(preferredBrands) } },
        ],
        AND: {
          stockQuantity: { gt: 0 },
          id: {
            notIn: userHistory.map((item) => item.productId),
          },
        },
      },
      include: {
        category: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      take: 10,
      orderBy: [{ isBestseller: 'desc' }, { reviews: { _count: 'desc' } }],
    });

    return recommendations;
  }

  async getSimilarProducts(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    if (!product) return [];

    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: product.categoryId },
          { brand: product.brand },
          {
            AND: [
              { topNotes: { contains: product.topNotes } },
              { baseNotes: { contains: product.baseNotes } },
            ],
          },
        ],
        NOT: {
          id: productId,
        },
        stockQuantity: { gt: 0 },
      },
      take: 6,
      orderBy: { reviews: { _count: 'desc' } },
    });

    return similarProducts;
  }
}
