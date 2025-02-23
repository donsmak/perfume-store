import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { mockProducts } from '../data/mock-products';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Initializing database...');

    // Create categories
    const categories = [
      {
        name: "Men's Fragrances",
        slug: 'mens-fragrances',
        description: 'Elegant and refined masculine fragrances',
      },
      {
        name: "Women's Fragrances",
        slug: 'womens-fragrances',
        description: 'Delicate and enchanting feminine fragrances',
      },
      {
        name: 'Unisex Fragrances',
        slug: 'unisex-fragrances',
        description: 'Universal fragrances for everyone',
      },
    ];

    // Create admin user
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '1234567890',
        role: 'ADMIN',
        isEmailVerified: true,
      },
    });

    console.log('Created admin user:', admin.email);

    // Create categories
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      });
    }

    console.log('Created categories');

    // Create products from mock data
    for (const product of mockProducts) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      });
    }

    console.log('Created products from mock data');
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
