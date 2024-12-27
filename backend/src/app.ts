import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './config/env.config';
validateEnv();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import morgan from 'morgan';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import config from './config';

// Routes

import productRoutes from './routes/products.routes';
import categoryRoutes from './routes/categories.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import addressRoutes from './routes/address.routes';
import adminRoutes from './routes/admin.routes';
import testRoutes from './routes/test.routes';
import cartRoutes from './routes/cart.routes';
import reviewRoutes from './routes/review.routes';
import wishlistRoutes from './routes/wishlist.routes';
import discountRoutes from './routes/discount.routes';
import recommendationRoutes from './routes/recommendation.routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.cors));
app.use(morgan('dev'));
app.use(rateLimiter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
