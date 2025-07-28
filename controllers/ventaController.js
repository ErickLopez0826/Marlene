exports.getVentaPorId = async (req, res) => {
  try {
    const venta = await ventaService.obtenerVentaPorId(req.params.id);
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    res.json(venta);
  } catch (error) {
    console.error(error); // Log del error real
    res.status(500).json({ message: 'error al consultar la venta', error });
  }
};
const ventaService = require('../services/ventaService');

exports.registrarVenta = async (req, res) => {
  try {
    const { productos, forma_pago } = req.body;
    
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Se requiere al menos un producto' });
    }
    
    if (!forma_pago) {
      return res.status(400).json({ message: 'Se requiere forma de pago' });
    }
    
    const venta = await ventaService.registrarVenta(productos, forma_pago);
    res.status(201).json(venta);
  } catch (error) {
    console.error('Error al registrar venta:', error);
    res.status(500).json({ message: 'Error al registrar la venta', error: error.message });
  }
};

exports.getHistorialVentas = async (req, res) => {
  try {
    const { tipoPago = 'todos', pagina = 1, porPagina = 30 } = req.query;
    
    console.log('📊 Parámetros recibidos:', { tipoPago, pagina, porPagina });
    
    const resultado = await ventaService.obtenerHistorialVentas(
      tipoPago, 
      parseInt(pagina), 
      parseInt(porPagina)
    );
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener historial de ventas:', error);
    res.status(500).json({ message: 'Error al obtener historial de ventas', error: error.message });
  }
};

exports.getDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await ventaService.obtenerDetalleVenta(id);
    
    if (!detalle) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    res.json(detalle);
  } catch (error) {
    console.error('Error al obtener detalle de venta:', error);
    res.status(500).json({ message: 'Error al obtener detalle de venta', error: error.message });
  }
};
