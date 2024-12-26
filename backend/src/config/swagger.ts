import { join } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Perfume Store API',
      version: '1.0.0',
      description: 'API documentation for the Perfume Store',
    },
    servers: [
      {
        url: `http://localhost:5000/api`,
        description: 'Development server',
      },
    ],
  },
  apis: [join(__dirname, '../docs/swagger.yaml')],
};

export const specs = swaggerJSDoc(options);
