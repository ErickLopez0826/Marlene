const usuariosRepository = require('../repositories/usuariosRepository');

async function validarCredenciales(usuario) {
  // Busca el usuario por nombre de usuario
  return await usuariosRepository.buscarPorUsuario(usuario);
}

module.exports = { validarCredenciales };
