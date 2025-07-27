const productosRepository = require('../repositories/productosRepository');

async function editarProducto(id, productoData) {
  return await productosRepository.actualizarProducto(id, productoData);
}

async function crearProducto(productoData) {
  return await productosRepository.insertarProducto(productoData);
}

async function obtenerProductoPorId(id) {
  return await productosRepository.buscarPorId(id);
}

async function obtenerProductosActivos() {
  return await productosRepository.listarActivos();
}

module.exports = {
  crearProducto,
  editarProducto,
  obtenerProductoPorId,
  obtenerProductosActivos
};
