const express = require('express');
const cajaController = require('../controllers/cajaController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/caja:
 *   get:
 *     summary: Obtiene todos los cortes de caja
 *     tags:
 *       - Caja
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cortes de caja
 *       401:
 *         description: No autorizado
 */
router.get('/', authMiddleware, cajaController.getCortes);

/**
 * @swagger
 * /api/caja/{id}:
 *   get:
 *     summary: Consulta el corte de caja por ID
 *     tags:
 *       - Caja
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del corte de caja
 *     responses:
 *       200:
 *         description: Corte de caja encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No hay corte registrado para ese ID
 */
router.get('/:id', authMiddleware, cajaController.getCajaPorId);

/**
 * @swagger
 * /api/caja:
 *   post:
 *     summary: Registra el corte de caja
 *     tags:
 *       - Caja
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Total_Efectivo
 *               - Total_Transferencia
 *               - Total_Caja
 *             properties:
 *               Total_Efectivo:
 *                 type: number
 *               Total_Transferencia:
 *                 type: number
 *               Total_Caja:
 *                 type: number
 *               Responsable:
 *                 type: string
 *               Observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Corte de caja registrado correctamente
 *       400:
 *         description: Campos obligatorios faltantes
 *       401:
 *         description: No autorizado
 */
router.post('/', authMiddleware, cajaController.registrarCorte);

module.exports = router;
