

const express = require('express');
const productosController = require('../controllers/productosController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Ruta temporal sin autenticación para pruebas
router.get('/test', async (req, res) => {
    try {
        const db = require('../config/db');
        const [productos] = await db.pool.query('SELECT * FROM producto LIMIT 5');
        res.json(productos);
    } catch (error) {
        console.error('Error en test productos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta temporal sin autenticación para obtener todos los productos
router.get('/all', async (req, res) => {
    try {
        console.log('🔍 Obteniendo todos los productos...');
        const db = require('../config/db');
        const [productos] = await db.promise.query('SELECT * FROM producto WHERE Activo = 1');
        console.log(`✅ Productos encontrados: ${productos.length}`);
        res.json(productos);
    } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtiene todos los productos activos
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos activos
 *   post:
 *     summary: Crea un nuevo producto
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *                 example: "Salas"
 *               Marca:
 *                 type: string
 *                 example: "La Costeña"
 *               Presentacion:
 *                 type: string
 *                 example: "Botella 250ml"
 *               Precio_Venta:
 *                 type: number
 *                 example: 100
 *               Precio_Compra:
 *                 type: number
 *                 example: 80
 *               Stock_Total:
 *                 type: integer
 *                 example: 10
 *               Activo:
 *                 type: integer
 *                 example: 1
 *               Fecha_Caducidad:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               ID_Proveedor:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', authMiddleware, productosController.crearProducto);
router.get('/', authMiddleware, productosController.getProductosActivos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 *   put:
 *     summary: Edita un producto por ID
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *                 example: "Salsa picante"
 *               Marca:
 *                 type: string
 *                 example: "La Costeña"
 *               Presentacion:
 *                 type: string
 *                 example: "Botella 250ml"
 *               Precio_Venta:
 *                 type: number
 *                 example: 80
 *               Precio_Compra:
 *                 type: number
 *                 example: 60
 *               Stock_Total:
 *                 type: integer
 *                 example: 20
 *               Activo:
 *                 type: integer
 *                 example: 1
 *               Fecha_Caducidad:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               ID_Proveedor:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Producto editado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', authMiddleware, productosController.editarProducto);
router.get('/:id', authMiddleware, productosController.getProductoPorId);

module.exports = router;
