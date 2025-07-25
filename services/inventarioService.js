async function obtenerHistorial(tipo, producto) {
  // Normalizar tipo: 'entrada' -> 'Entrada', 'salida' -> 'Salida'
  if (tipo) {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower === 'entrada') tipo = 'Entrada';
    else if (tipoLower === 'salida') tipo = 'Salida';
  }
  return await inventarioRepository.listarMovimientos(tipo, producto);
}

async function obtenerPorId(id) {
  return await inventarioRepository.buscarPorId(id);
}

const inventarioRepository = require('../repositories/inventarioRepository');
const productosRepository = require('../repositories/productosRepository');

async function registrarMovimiento(data, usuario) {
  // Validar existencia del producto
  const producto = await productosRepository.buscarPorId(data.ID_Producto);
  if (!producto) throw new Error('Producto no existe');

  // Normalizar tipo: 'entrada' -> 'Entrada', 'salida' -> 'Salida'
  let tipo = data.Tipo_Movimiento;
  if (tipo) {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower === 'entrada') tipo = 'Entrada';
    else if (tipoLower === 'salida') tipo = 'Salida';
  }
  const movimientoData = {
    ID_Producto: data.ID_Producto,
    Tipo_Movimiento: tipo,
    Cantidad: data.Cantidad,
    Fecha_Movimiento: new Date(),
    Observaciones: data.Observaciones || '',
    ID_Usuario: usuario.ID_Usuario
  };
  const movimiento = await inventarioRepository.insertarMovimiento(movimientoData);

  // Actualizar stock si es salida o entrada
  if (tipo === 'Salida') {
    await productosRepository.descontarStock(data.ID_Producto, data.Cantidad);
  } else if (tipo === 'Entrada') {
    await productosRepository.aumentarStock(data.ID_Producto, data.Cantidad);
  }

  return movimiento;
}

module.exports = { obtenerHistorial, obtenerPorId, registrarMovimiento };
