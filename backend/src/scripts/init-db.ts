import { PrismaClient } from '@prisma/client';
import { initializeDatabase } from '../utils/database';
import { mockProducts } from '../data/mock-products';

const prisma = new PrismaClient();

async function main() {
  initializeDatabase();

  const categories = [
    {
      name: "Men's Fragrances",
      slug: 'mens-fragrances',
      description: 'Une collection de parfums masculins élégants et raffinés',
    },
    {
      name: "Women's Fragrances",
      slug: 'womens-fragrances',
      description: 'Des parfums féminins délicats et envoûtants',
    },
    {
      name: 'Unisex Fragrances',
      slug: 'unisex-fragrances',
      description: 'Des fragrances universelles pour tous',
    },
  ];
  try {
    console.log('Creating products...');
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      });
    }

    console.log('Creating products...');
    for (const product of mockProducts) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      });
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
