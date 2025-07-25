const express = require('express');
const inventarioController = require('../controllers/inventarioController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Obtiene el historial de movimientos de inventario
 *     tags:
 *       - Inventario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de inventario
 *   post:
 *     summary: Registra un movimiento de inventario
 *     tags:
 *       - Inventario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Producto:
 *                 type: integer
 *               Tipo_Movimiento:
 *                 type: string
 *                 enum: [Entrada, Salida]
 *               Cantidad:
 *                 type: integer
 *               Observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movimiento registrado
 *       400:
 *         description: Datos inválidos
 */
router.get('/', authMiddleware, inventarioController.obtenerHistorial);
router.post('/', authMiddleware, inventarioController.registrarMovimiento);

/**
 * @swagger
 * /api/inventario/{id}:
 *   get:
 *     summary: Consulta un movimiento de inventario por ID
 *     tags:
 *       - Inventario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del movimiento de inventario
 *     responses:
 *       200:
 *         description: Movimiento encontrado
 *       404:
 *         description: Movimiento no encontrado
 */
router.get('/:id', authMiddleware, inventarioController.obtenerPorId);

module.exports = router;
