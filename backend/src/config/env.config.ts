export const validateEnv = () => {
  const required = ['JWT_SECRET', 'PORT', 'DATABASE_URL', 'REDIS_URL'];

  for (const name of required) {
    if (!process.env[name]) {
      throw new Error(`Environment variable ${name} is missing`);
    }
  }
};
