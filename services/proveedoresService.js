const proveedoresRepository = require('../repositories/proveedoresRepository');

async function obtenerProveedores() {
  return await proveedoresRepository.listarTodos();
}

module.exports = {
  obtenerProveedores
}; 