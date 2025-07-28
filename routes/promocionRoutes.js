const express = require('express');
const promocionController = require('../controllers/promocionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Ruta temporal sin autenticación para pruebas
router.get('/test', async (req, res) => {
    try {
        const db = require('../config/db');
        console.log('🔍 Probando consulta de promociones...');
        
        // Probar tabla promocion
        const [promociones] = await db.pool.query('SELECT * FROM promocion LIMIT 5');
        console.log('📊 Promociones encontradas:', promociones.length);
        
        // Probar tabla promocion_producto
        const [relaciones] = await db.pool.query('SELECT * FROM promocion_producto LIMIT 5');
        console.log('📊 Relaciones encontradas:', relaciones.length);
        
        // Probar JOIN completo
        const [joinResult] = await db.pool.query(`
            SELECT p.ID_Promocion, p.Descripcion, p.Tipo, p.Descuento_Porcentual,
                   pp.ID_Producto, pp.Cantidad,
                   pr.Nombre_Producto
            FROM promocion p
            LEFT JOIN promocion_producto pp ON p.ID_Promocion = pp.ID_Promocion
            LEFT JOIN producto pr ON pp.ID_Producto = pr.ID_Producto
            ORDER BY p.ID_Promocion
        `);
        console.log('📊 Resultados del JOIN:', joinResult.length);
        
        res.json({
            promociones: promociones,
            relaciones: relaciones,
            joinResult: joinResult
        });
    } catch (error) {
        console.error('❌ Error en test promociones:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta temporal sin autenticación para obtener todas las promociones
router.get('/all', async (req, res) => {
    try {
        console.log('🔍 Obteniendo todas las promociones...');
        const db = require('../config/db');
        const [promociones] = await db.promise.query('SELECT * FROM promocion');
        console.log(`✅ Promociones encontradas: ${promociones.length}`);
        res.json(promociones);
    } catch (error) {
        console.error('❌ Error al obtener promociones:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/promociones:
 *   get:
 *     summary: Lista todas las promociones
 *     tags:
 *       - Promociones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de promociones
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
 *               descripcion:
 *                 type: string
 *                 example: "Descuento 20% en bebidas"
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-25"
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-25"
 *               tipo:
 *                 type: string
 *                 example: "Descuento"
 *               valor:
 *                 type: number
 *                 example: 20
 *               observaciones:
 *                 type: string
 *                 example: "Promoción especial de verano"
 *               productos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Promoción creada
 *       400:
 *         description: Datos inválidos
 */
router.get('/', authMiddleware, promocionController.getPromociones);
router.post('/', authMiddleware, promocionController.crearPromocion);
router.get('/:id', authMiddleware, promocionController.getPromocionPorId);
router.put('/:id/toggle', authMiddleware, promocionController.togglePromocion);
router.delete('/:id', authMiddleware, promocionController.eliminarPromocion);

module.exports = router;
