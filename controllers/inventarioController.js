exports.obtenerHistorial = async (req, res) => {
  console.log('Entrando a obtenerHistorial');
  try {
    let { tipo, producto } = req.query;
    if (tipo) {
      const tipoLower = tipo.toLowerCase();
      if (tipoLower === 'entrada') tipo = 'Entrada';
      else if (tipoLower === 'salida') tipo = 'Salida';
    }
    const historial = await inventarioService.obtenerHistorial(tipo, producto);
    res.json(historial);
  } catch (error) {
    console.error('Error en GET /api/inventario:', error);
    res.status(500).json({ message: 'Error al consultar historial', error });
  }
};
const inventarioService = require('../services/inventarioService');

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const movimiento = await inventarioService.obtenerPorId(id);
    if (!movimiento) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    res.json(movimiento);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar movimiento', error });
  }
};

exports.registrarMovimiento = async (req, res) => {
  try {
    // Adaptar body para aceptar variantes
    const ID_Producto = req.body.ID_Producto || req.body.producto_id;
    let Tipo_Movimiento = req.body.Tipo_Movimiento || req.body.tipo;
    const Cantidad = req.body.Cantidad || req.body.cantidad;
    if (!ID_Producto || !Tipo_Movimiento || !Cantidad) {
      return res.status(400).json({ message: 'ID_Producto, Tipo_Movimiento y Cantidad son obligatorios' });
    }
    // Normalizar tipo: 'entrada' -> 'Entrada', 'salida' -> 'Salida'
    if (Tipo_Movimiento) {
      const tipoLower = Tipo_Movimiento.toLowerCase();
      if (tipoLower === 'entrada') Tipo_Movimiento = 'Entrada';
      else if (tipoLower === 'salida') Tipo_Movimiento = 'Salida';
    }
    const bodyAdaptado = {
      ID_Producto,
      Tipo_Movimiento,
      Cantidad,
      Observaciones: req.body.Observaciones || req.body.observaciones || ''
    };
    const movimiento = await inventarioService.registrarMovimiento(bodyAdaptado, req.user);
    res.status(201).json(movimiento);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar movimiento', error: error.message || error });
  }
};
