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

const app = express();

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

// Error handling middleware should be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
