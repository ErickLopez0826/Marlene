const express = require('express');
const promocionController = require('../controllers/promocionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/promociones:
 *   get:
 *     summary: Lista todas las promociones activas
 *     tags:
 *       - Promociones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de promociones activas
 *   post:
 *     summary: Crea una nueva promoción
 *     tags:
 *       - Promociones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Descripcion:
 *                 type: string
 *                 example: "2 x 1"
 *               Fecha_Inicio:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-25"
 *               Fecha_Fin:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-25"
 *               Activo:
 *                 type: integer
 *                 example: 1
 *               Tipo:
 *                 type: string
 *                 example: "Descuento"
 *               Descuento_Porcentual:
 *                 type: number
 *                 example: 10
 *               Precio_Promocional:
 *                 type: number
 *                 example: null
 *     responses:
 *       201:
 *         description: Promoción creada
 *       400:
 *         description: Datos inválidos
 */
router.get('/', authMiddleware, promocionController.listarPromocionesActivas);
router.post('/', authMiddleware, promocionController.crearPromocion);
router.get('/:id', authMiddleware, promocionController.getPromocionPorId);

module.exports = router;
