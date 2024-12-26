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

// Routes

import productRoutes from './routes/products.routes';
import categoryRoutes from './routes/categories.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import addressRoutes from './routes/address.routes';
import adminRoutes from './routes/admin.routes';
import testRoutes from './routes/test.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(errorHandler);

process.on('unhandledRejection', (err: Error) => {
  logger.error('UnhandledRejection', err.message);
  logger.error(err.stack);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception', err.message);
  logger.error(err.stack);
  process.exit(1);
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
