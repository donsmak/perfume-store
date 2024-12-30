import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { mockProducts } from '../data/mock-products';
import { Database } from 'sqlite3';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const prisma = new PrismaClient();

async function enableWALMode() {
  return new Promise(async (resolve, reject) => {
    try {
      const dbPath = join(__dirname, '../../prisma/store.db')

      await mkdir(dirname(dbPath), { recursive: true });
      const db = new Database(dbPath);

      db.serialize(() => {
        db.run('PRAGMA journal_mode=WAL', (err) => {
          if (err) {
            db.close();
            reject(err);
          }
        });

        db.run('PRAGMA synchronous=NORMAL', (err) => {
          if (err) {
            db.close();
            reject(err);
          }
        });

        db.close((err) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function main() {
  try {
    console.log('Initializing database...');

    await enableWALMode();

    console.log('WAL mode enabled');

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
