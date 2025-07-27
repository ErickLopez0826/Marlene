
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

async function obtenerVentaPorId(id) {
  return await obtenerVentaConDetalle(id);
}

async function crearVenta(data, usuario) {
  // Buscar caja activa
  const cajaActiva = await cajaRepository.obtenerCajaActiva();
  if (!cajaActiva) throw new Error('No hay caja activa');

  // Calcular el total de la venta
  let montoTotal = 0;
  const detalleList = [];
  for (const item of data.productos) {
    // Obtener el producto y su precio
    const producto = await productosRepository.buscarPorId(item.producto_id);
    if (!producto) throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
    const precioUnitario = producto.Precio_Venta;
    const subtotal = precioUnitario * item.cantidad;
    montoTotal += subtotal;
    detalleList.push({
      ID_Producto: item.producto_id,
      Cantidad: item.cantidad,
      Precio_Unitario: precioUnitario,
      Subtotal: subtotal
    });
  }

  // Registrar venta
  const ventaData = {
    Fecha_Venta: new Date(),
    Monto_Total: montoTotal,
    Forma_Pago: data.forma_pago,
    ID_Caja: cajaActiva.ID_Caja,
    ID_Usuario: usuario.ID_Usuario
  };
  const venta = await ventaRepository.insertarVenta(ventaData);

  // Registrar detalle y descontar stock
  for (const detalle of detalleList) {
    await detalleVentaRepository.insertarDetalle({
      ID_Venta: venta.ID_Venta,
      ...detalle
    });
    await productosRepository.descontarStock(detalle.ID_Producto, detalle.Cantidad);
    await inventarioRepository.registrarSalida(detalle.ID_Producto, detalle.Cantidad, venta.ID_Venta);
  }

  return venta;
}

module.exports = {
  crearVenta,
  obtenerVentaConDetalle,
  obtenerVentaPorId
};
