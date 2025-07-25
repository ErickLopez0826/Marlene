const express = require('express');
const ventaController = require('../controllers/ventaController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/venta/{id}:
 *   get:
 *     summary: Obtiene una venta por ID
 *     tags:
 *       - Venta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Venta encontrada
 *       404:
 *         description: Venta no encontrada
 */
router.get('/:id', authMiddleware, ventaController.getVentaPorId);

/**
 * @swagger
 * /api/venta:
 *   post:
 *     summary: Crea una nueva venta
 *     tags:
 *       - Venta
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     producto_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *               total:
 *                 type: number
 *     responses:
 *       201:
 *         description: Venta creada
 *       400:
 *         description: Datos inválidos
 */
router.post('/', authMiddleware, ventaController.crearVenta);

module.exports = router;
