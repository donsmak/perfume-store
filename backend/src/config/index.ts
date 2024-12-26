import dotenv from 'dotenv';

dotenv.config();

const config = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};

export default config;
