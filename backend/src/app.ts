import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import morgan from 'morgan';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import config from './config';
import categoryRoutes from './routes/category.routes';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import adminRoutes from './routes/admin.routes';
import reviewRoutes from './routes/review.routes';
import addressRoutes from './routes/address.routes';
import cartRoutes from './routes/cart.routes';
import { cacheService } from './services/cache.service';
import { redis } from './lib/redis';
import orderRoutes from './routes/order.routes';
const app = express();

async function startServer() {
  try {
    // Initialize cache service
    await cacheService.initialize();

    // Initialize Redis before starting the server
    await redis.ping();
    logger.info('Connected to Redis');

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));

    // Security middleware
    app.use(cors(config.cors));
    app.use(helmet());
    app.use(rateLimiter);

    // Routes
    app.use('/api/v1/categories', categoryRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/products', productRoutes);
    app.use('/api/v1/admin', adminRoutes);
    app.use('/api/v1/reviews', reviewRoutes);
    app.use('/api/v1/addresses', addressRoutes);
    app.use('/api/v1/cart', cartRoutes);
    app.use('/api/v1/orders', orderRoutes);

    // Error handling
    process.on('unhandledRejection', (err: Error) => {
      logger.error('UnhandledRejection', err.message);
      logger.error(err.stack);
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception', err.message);
      logger.error(err.stack);
      process.exit(1);
    });

    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
