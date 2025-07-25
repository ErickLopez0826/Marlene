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
 *               nombre:
 *                 type: string
 *               descuento:
 *                 type: number
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Promoción creada
 *       400:
 *         description: Datos inválidos
 */
router.get('/', authMiddleware, promocionController.listarPromocionesActivas);
router.post('/', authMiddleware, promocionController.crearPromocion);

module.exports = router;
