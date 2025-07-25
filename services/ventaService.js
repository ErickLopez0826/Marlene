
const ventaRepository = require('../repositories/ventaRepository');
const detalleVentaRepository = require('../repositories/detalleVentaRepository');
const productosRepository = require('../repositories/productosRepository');
const inventarioRepository = require('../repositories/inventarioRepository');
const cajaRepository = require('../repositories/cajaRepository');

async function obtenerVentaConDetalle(id) {
  const venta = await ventaRepository.buscarPorId(id);
  if (!venta) return null;
  const detalle = await detalleVentaRepository.buscarPorVenta(id);
  venta.detalle = detalle;
  return venta;
}

module.exports.obtenerVentaConDetalle = obtenerVentaConDetalle;

async function crearVenta(data, usuario) {
  // Buscar caja activa
  const cajaActiva = await cajaRepository.obtenerCajaActiva();
  if (!cajaActiva) throw new Error('No hay caja activa');

  // Registrar venta
  const ventaData = {
    Fecha_Venta: new Date(),
    Monto_Total: data.Monto_Total,
    Forma_Pago: data.Forma_Pago,
    ID_Caja: cajaActiva.ID_Caja,
    ID_Usuario: usuario.ID_Usuario
  };
  const venta = await ventaRepository.insertarVenta(ventaData);

  // Registrar detalle y descontar stock
  for (const detalle of data.detalle) {
    await detalleVentaRepository.insertarDetalle({
      ID_Venta: venta.ID_Venta,
      ID_Producto: detalle.ID_Producto,
      Cantidad: detalle.Cantidad,
      Precio_Unitario: detalle.Precio_Unitario,
      Subtotal: detalle.Subtotal
    });
    await productosRepository.descontarStock(detalle.ID_Producto, detalle.Cantidad);
    await inventarioRepository.registrarSalida(detalle.ID_Producto, detalle.Cantidad, venta.ID_Venta);
  }

  return venta;
}

module.exports = { crearVenta };
