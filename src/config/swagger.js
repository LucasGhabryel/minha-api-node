const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'minha-api-node',
      version: '1.0.0',
      description: 'Documentação da API nexus',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Ambiente local',
      },
      {
        url: 'https://minha-api-node-td6g.onrender.com',
        description: 'Produção',
      }
    ],

     components: {
      securitySchemes: {
        bearerAuth: {           // ← importante pro seu sistema de token!
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // ← onde estão suas rotas
}

module.exports = swaggerJsdoc(options)