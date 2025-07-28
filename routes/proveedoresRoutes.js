const express = require('express');
const proveedoresController = require('../controllers/proveedoresController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/proveedores:
 *   get:
 *     summary: Obtiene todos los proveedores
 *     tags:
 *       - Proveedores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *       500:
 *         description: Error del servidor
 */
router.get('/', authMiddleware, proveedoresController.getProveedores);

module.exports = router; 