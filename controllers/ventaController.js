exports.getVentaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const venta = await ventaService.obtenerVentaConDetalle(id);
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    res.json(venta);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar la venta', error });
  }
};
const ventaService = require('../services/ventaService');

exports.crearVenta = async (req, res) => {
  try {
    const venta = await ventaService.crearVenta(req.body, req.user);
    res.status(201).json(venta);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar la venta', error });
  }
};
