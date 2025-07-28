const express = require('express');
const ventaController = require('../controllers/ventaController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/venta:
 *   post:
 *     summary: Registra una nueva venta
 *     tags:
 *       - Ventas
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
 *               forma_pago:
 *                 type: string
 *                 enum: [Efectivo, Transferencia, Mixto]
 *     responses:
 *       201:
 *         description: Venta registrada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', authMiddleware, ventaController.registrarVenta);

/**
 * @swagger
 * /api/venta/historial:
 *   get:
 *     summary: Obtiene el historial de ventas
 *     tags:
 *       - Ventas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de ventas obtenido exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/historial', authMiddleware, ventaController.getHistorialVentas);

/**
 * @swagger
 * /api/venta/{id}/detalle:
 *   get:
 *     summary: Obtiene el detalle de una venta específica
 *     tags:
 *       - Ventas
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
 *         description: Detalle de venta obtenido exitosamente
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/detalle', authMiddleware, ventaController.getDetalleVenta);

module.exports = router;
