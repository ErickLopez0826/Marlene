const usuariosRepository = require('../repositories/usuariosRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function authenticateUser(username, password) {
  try {
    console.log(`🔍 Autenticando usuario: ${username}`);
    
    const user = await usuariosRepository.buscarPorUsuario(username);
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return null;
    }
    
    // Comparar contraseñas (sin hash por ahora)
    if (password !== user.Contrasenha) {
      console.log('❌ Contraseña incorrecta');
      return null;
    }
    
    console.log('✅ Usuario autenticado correctamente');
    return user;
  } catch (error) {
    console.error('❌ Error en authenticateUser:', error);
    throw error;
  }
}

async function checkUserExists(username) {
  try {
    console.log(`🔍 Verificando si existe usuario: ${username}`);
    
    const user = await usuariosRepository.buscarPorUsuario(username);
    const exists = !!user;
    
    console.log(`📊 Usuario ${username} existe: ${exists}`);
    return exists;
  } catch (error) {
    console.error('❌ Error en checkUserExists:', error);
    throw error;
  }
}

async function createUser(userData) {
  try {
    console.log('📤 Creando nuevo usuario:', userData);
    
    // Verificar si el usuario ya existe
    const exists = await checkUserExists(userData.Usuario);
    if (exists) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    
    // Crear el usuario
    const newUser = await usuariosRepository.insertarUsuario(userData);
    
    console.log('✅ Usuario creado exitosamente:', newUser.ID_Usuario);
    return newUser;
  } catch (error) {
    console.error('❌ Error en createUser:', error);
    throw error;
  }
}

async function getUserById(userId) {
  try {
    console.log(`🔍 Obteniendo usuario por ID: ${userId}`);
    
    const user = await usuariosRepository.buscarPorId(userId);
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return null;
    }
    
    console.log('✅ Usuario encontrado');
    return user;
  } catch (error) {
    console.error('❌ Error en getUserById:', error);
    throw error;
  }
}

function generateToken(user) {
  try {
    console.log('🔑 Generando token JWT para usuario:', user.ID_Usuario);
    
    const token = jwt.sign(
      {
        ID_Usuario: user.ID_Usuario,
        Usuario: user.Usuario,
        Rol: user.Rol || 'usuario'
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    
    console.log('✅ Token JWT generado exitosamente');
    return token;
  } catch (error) {
    console.error('❌ Error en generateToken:', error);
    throw error;
  }
}

module.exports = {
  authenticateUser,
  checkUserExists,
  createUser,
  getUserById,
  generateToken
};
