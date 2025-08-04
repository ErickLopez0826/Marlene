const productosRepository = require('../repositories/productosRepository');

// Este método delega al repositorio que ejecuta el procedimiento: CALL ListarProductos()
async function obtenerTodosLosProductos() {
  return await productosRepository.listarProductos();
}

// Este método delega al repositorio que ejecuta el procedimiento: CALL ObtenerProducto(?)
async function obtenerProductoPorId(id) {
  return await productosRepository.obtenerProducto(id);
}

// Este método delega al repositorio que ejecuta el procedimiento: CALL InsertarProducto(...)
async function crearProducto(productoData) {
  return await productosRepository.insertarProducto(productoData);
}

// Este método delega al repositorio que ejecuta el procedimiento: CALL ActualizarProducto(...)
async function editarProducto(id, productoData) {
  return await productosRepository.actualizarProducto(id, productoData);
}

// Este método delega al repositorio que ejecuta el procedimiento: CALL EliminarProducto(?)
async function eliminarProducto(id) {
  return await productosRepository.eliminarProducto(id);
}

module.exports = {
  obtenerTodosLosProductos,
  obtenerProductoPorId,
  crearProducto,
  editarProducto,
  eliminarProducto
};
