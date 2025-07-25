async function editarProducto(id, productoData) {
  return await productosRepository.actualizarProducto(id, productoData);
}

module.exports.editarProducto = editarProducto;
async function crearProducto(productoData) {
  return await productosRepository.insertarProducto(productoData);
}

module.exports.crearProducto = crearProducto;
async function obtenerProductoPorId(id) {
  return await productosRepository.buscarPorId(id);
}

module.exports.obtenerProductoPorId = obtenerProductoPorId;
const productosRepository = require('../repositories/productosRepository');

async function obtenerProductosActivos() {
  return await productosRepository.listarActivos();
}

module.exports = { obtenerProductosActivos };
