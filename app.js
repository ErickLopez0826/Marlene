
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const db = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/login', require('./routes/authRoutes'));
app.use('/api/venta', require('./routes/ventaRoutes'));
app.use('/api/inventario', require('./routes/inventarioRoutes'));
app.use('/api/caja', require('./routes/cajaRoutes'));
app.use('/api/promociones', require('./routes/promocionRoutes'));

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Lucy',
      version: '1.0.0',
      description: 'Documentación de la API Lucy',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Accede a la API en: http://localhost:${PORT}/`);
  console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
