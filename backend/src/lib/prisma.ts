import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  }
});

prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query ${params.model}.${params.action} took ${after - before}ms`);
  }

  return result;
});

prisma
  .$connect()
  .then(() => {
    logger.info('Database connected');
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
