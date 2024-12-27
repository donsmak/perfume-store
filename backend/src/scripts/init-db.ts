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
        nameEn: "Men's Fragrances",
        nameFr: 'Parfums Homme',
        nameAr: 'عطور رجالية',
        slug: 'mens-fragrances',
        descriptionEn: 'Elegant and refined masculine fragrances',
        descriptionFr: 'Une collection de parfums masculins élégants et raffinés',
        descriptionAr: 'عطور رجالية أنيقة وراقية',
      },
      {
        nameEn: "Women's Fragrances",
        nameFr: 'Parfums Femme',
        nameAr: 'عطور نسائية',
        slug: 'womens-fragrances',
        descriptionEn: 'Delicate and enchanting feminine fragrances',
        descriptionFr: 'Des parfums féminins délicats et envoûtants',
        descriptionAr: 'عطور نسائية ناعمة وساحرة',
      },
      {
        nameEn: 'Unisex Fragrances',
        nameFr: 'Parfums Unisexe',
        nameAr: 'عطور للجنسين',
        slug: 'unisex-fragrances',
        descriptionEn: 'Universal fragrances for everyone',
        descriptionFr: 'Des fragrances universelles pour tous',
        descriptionAr: 'عطور عالمية للجميع',
      },
    ];

    // Create admin user
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password_hashed: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
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
        create: {
          nameEn: category.nameEn,
          nameFr: category.nameFr,
          nameAr: category.nameAr,
          slug: category.slug,
          descriptionEn: category.descriptionEn,
          descriptionFr: category.descriptionFr,
          descriptionAr: category.descriptionAr,
        },
      });
    }

    console.log('Created categories');

    // Create products from mock data
    for (const product of mockProducts) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          nameEn: product.name,
          nameFr: product.name,
          nameAr: product.name,
          slug: product.slug,
          brand: product.brand,
          descriptionEn: product.description,
          descriptionFr: product.description,
          descriptionAr: product.description,
          price: product.price,
          volume: product.volume,
          stockQuantity: product.stockQuantity,
          isFeatured: product.isFeatured,
          isBestseller: product.isBestseller,
          image: product.image,
          categoryId: product.categoryId,
          // Convert arrays to JSON strings for SQLite storage
          topNotes: JSON.stringify(product.topNotes.split(',').map((note) => note.trim())),
          middleNotes: JSON.stringify(product.middleNotes.split(',').map((note) => note.trim())),
          baseNotes: JSON.stringify(product.baseNotes.split(',').map((note) => note.trim())),
          searchVector: '', // Add empty searchVector as it's required
        },
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
