const db = require('../config/db');

async function buscarPorUsuario(usuario) {
  try {
    console.log(`🔍 Buscando usuario: ${usuario}`);
    
    const sql = 'SELECT * FROM usuario WHERE Usuario = ?';
    const [rows] = await db.promise.query(sql, [usuario]);
    
    console.log(`📊 Usuarios encontrados: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('✅ Usuario encontrado:', rows[0].ID_Usuario);
      return rows[0];
    }
    
    console.log('❌ Usuario no encontrado');
    return null;
  } catch (error) {
    console.error('❌ Error en buscarPorUsuario:', error);
    throw error;
  }
}

async function buscarPorId(id) {
  try {
    console.log(`🔍 Buscando usuario por ID: ${id}`);
    
    const sql = 'SELECT * FROM usuario WHERE ID_Usuario = ?';
    const [rows] = await db.promise.query(sql, [id]);
    
    console.log(`📊 Usuarios encontrados: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('✅ Usuario encontrado');
      return rows[0];
    }
    
    console.log('❌ Usuario no encontrado');
    return null;
  } catch (error) {
    console.error('❌ Error en buscarPorId:', error);
    throw error;
  }
}

async function insertarUsuario(userData) {
  try {
    console.log('📤 Insertando nuevo usuario:', userData);
    
    const sql = `
      INSERT INTO usuario (Nombre, Rol, Usuario, Contrasenha) 
      VALUES (?, ?, ?, ?)
    `;
    
    const values = [
      userData.Nombre,
      userData.Rol,
      userData.Usuario,
      userData.Contrasenha
    ];
    
    console.log('📄 SQL:', sql);
    console.log('📄 Valores:', values);
    
    const [result] = await db.promise.query(sql, values);
    console.log('✅ Usuario insertado con ID:', result.insertId);
    
    // Obtener el usuario recién creado
    const newUser = await buscarPorId(result.insertId);
    
    return newUser;
  } catch (error) {
    console.error('❌ Error en insertarUsuario:', error);
    throw error;
  }
}

async function listarTodos() {
  try {
    console.log('🔍 Listando todos los usuarios...');
    
    const sql = 'SELECT ID_Usuario, Nombre, Usuario, Rol FROM usuario ORDER BY Nombre';
    const [rows] = await db.promise.query(sql);
    
    console.log(`📊 Usuarios encontrados: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('❌ Error en listarTodos:', error);
    throw error;
  }
}

async function actualizarUsuario(id, userData) {
  try {
    console.log(`📝 Actualizando usuario ${id}:`, userData);
    
    const sql = `
      UPDATE usuario 
      SET Nombre = ?, Rol = ?, Usuario = ?, Contrasenha = ?
      WHERE ID_Usuario = ?
    `;
    
    const values = [
      userData.Nombre,
      userData.Rol,
      userData.Usuario,
      userData.Contrasenha,
      id
    ];
    
    const [result] = await db.promise.query(sql, values);
    console.log('✅ Usuario actualizado');
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('❌ Error en actualizarUsuario:', error);
    throw error;
  }
}

async function eliminarUsuario(id) {
  try {
    console.log(`🗑️ Eliminando usuario ${id}...`);
    
    const sql = 'DELETE FROM usuario WHERE ID_Usuario = ?';
    const [result] = await db.promise.query(sql, [id]);
    
    console.log('✅ Usuario eliminado');
    return result.affectedRows > 0;
  } catch (error) {
    console.error('❌ Error en eliminarUsuario:', error);
    throw error;
  }
}

module.exports = {
  buscarPorUsuario,
  buscarPorId,
  insertarUsuario,
  listarTodos,
  actualizarUsuario,
  eliminarUsuario
};
