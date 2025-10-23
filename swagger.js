import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Manager API',
      version: '1.0.0',
      description: 'Documentation de l’API Time Manager',
    },
    servers: [
      {
        url: 'http://localhost:80', 
      },
    ],
  },
  apis: ['./routes/*.js'], // indique où se trouvent tes routes avec les annotations Swagger
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
