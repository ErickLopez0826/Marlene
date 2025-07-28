const db = require('../config/db');

async function listarTodas() {
  try {
    console.log('🔍 Listando todas las promociones...');
    
    const sql = 'SELECT * FROM promocion ORDER BY Fecha_Inicio DESC';
    const [rows] = await db.promise.query(sql);
    
    console.log(`📊 Promociones encontradas: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('❌ Error en listarTodas:', error);
    throw error;
  }
}

async function buscarActivasPorFecha(fecha) {
  try {
    console.log(`🔍 Buscando promociones activas para fecha: ${fecha}`);
    
    const sql = `
      SELECT * FROM promocion 
      WHERE Activo = 1 
      AND Fecha_Inicio <= ? 
      AND Fecha_Fin >= ?
      ORDER BY Fecha_Inicio DESC
    `;
    
    const [rows] = await db.promise.query(sql, [fecha, fecha]);
    console.log(`📊 Promociones activas encontradas: ${rows.length}`);
    
    return rows;
  } catch (error) {
    console.error('❌ Error en buscarActivasPorFecha:', error);
    throw error;
  }
}

async function insertarPromocion(data) {
  try {
    console.log('📤 Insertando nueva promoción:', data);
    
    const sql = `
      INSERT INTO promocion (Descripcion, Fecha_Inicio, Fecha_Fin, Tipo, Descuento_Porcentual, Precio_Promocional, Activo) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      data.Descripcion,
      data.Fecha_Inicio,
      data.Fecha_Fin,
      data.Tipo,
      data.Descuento_Porcentual,
      data.Precio_Promocional,
      data.Activo || 1
    ];
    
    console.log('📄 SQL:', sql);
    console.log('📄 Valores:', values);
    
    const [result] = await db.promise.query(sql, values);
    console.log('✅ Promoción insertada con ID:', result.insertId);
    
    // Retornar la promoción creada con el ID
    return {
      ID_Promocion: result.insertId,
      ...data
    };
  } catch (error) {
    console.error('❌ Error en insertarPromocion:', error);
    throw error;
  }
}

async function buscarPorId(ID_Promocion) {
  try {
    console.log(`🔍 Buscando promoción con ID: ${ID_Promocion}`);
    
    const sql = 'SELECT * FROM promocion WHERE ID_Promocion = ?';
    const [rows] = await db.promise.query(sql, [ID_Promocion]);
    
    if (rows.length > 0) {
      console.log('✅ Promoción encontrada');
      return rows[0];
    } else {
      console.log('❌ Promoción no encontrada');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en buscarPorId:', error);
    throw error;
  }
}

async function actualizarPromocion(ID_Promocion, data) {
  try {
    console.log(`🔄 Actualizando promoción ${ID_Promocion}:`, data);
    
    const sql = `
      UPDATE promocion 
      SET Descripcion = ?, Fecha_Inicio = ?, Fecha_Fin = ?, Tipo = ?, 
          Descuento_Porcentual = ?, Precio_Promocional = ?, Activo = ?
      WHERE ID_Promocion = ?
    `;
    
    const values = [
      data.Descripcion,
      data.Fecha_Inicio,
      data.Fecha_Fin,
      data.Tipo,
      data.Descuento_Porcentual,
      data.Precio_Promocional,
      data.Activo,
      ID_Promocion
    ];
    
    await db.promise.query(sql, values);
    console.log('✅ Promoción actualizada correctamente');
    
    return await buscarPorId(ID_Promocion);
  } catch (error) {
    console.error('❌ Error en actualizarPromocion:', error);
    throw error;
  }
}

async function eliminarPromocion(ID_Promocion) {
  try {
    console.log(`🗑️ Eliminando promoción ${ID_Promocion} de la base de datos...`);
    
    const sql = 'DELETE FROM promocion WHERE ID_Promocion = ?';
    const [result] = await db.promise.query(sql, [ID_Promocion]);
    
    console.log('✅ Promoción eliminada correctamente');
    return result;
  } catch (error) {
    console.error('❌ Error en eliminarPromocion:', error);
    throw error;
  }
}

module.exports = {
  listarTodas,
  buscarActivasPorFecha,
  insertarPromocion,
  buscarPorId,
  actualizarPromocion,
  eliminarPromocion
};
