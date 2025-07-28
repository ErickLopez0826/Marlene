const db = require('../config/db');

async function listarCajas() {
  try {
    console.log('🔍 Listando todas las cajas...');
    
    const sql = 'SELECT * FROM caja ORDER BY Fecha_Corte DESC';
    const [rows] = await db.promise.query(sql);
    
    console.log(`📊 Cajas encontradas: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('❌ Error en listarCajas:', error);
    throw error;
  }
}

async function buscarPorId(id) {
  try {
    console.log(`🔍 Buscando caja con ID: ${id}`);
    
    const sql = 'SELECT * FROM caja WHERE ID_Caja = ?';
    const [rows] = await db.promise.query(sql, [id]);
    
    if (rows.length > 0) {
      console.log('✅ Caja encontrada');
      return rows[0];
    } else {
      console.log('❌ Caja no encontrada');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en buscarPorId:', error);
    throw error;
  }
}

async function buscarPorFecha(fecha) {
  try {
    console.log(`🔍 Buscando caja por fecha: ${fecha}`);
    
    const sql = 'SELECT * FROM caja WHERE DATE(Fecha_Corte) = ? ORDER BY Fecha_Corte DESC LIMIT 1';
    const [rows] = await db.promise.query(sql, [fecha]);
    
    if (rows.length > 0) {
      console.log('✅ Caja encontrada para la fecha');
      return rows[0];
    } else {
      console.log('❌ No se encontró caja para la fecha');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en buscarPorFecha:', error);
    throw error;
  }
}

async function insertarCorte(corteData) {
  try {
    console.log('📤 Insertando nuevo corte de caja:', corteData);
    
    const sql = `
      INSERT INTO caja (Fecha_Corte, Total_Efectivo, Total_Transferencia, Total_Caja, Responsable, Observaciones, ID_Usuario) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      corteData.Fecha_Corte,
      corteData.Total_Efectivo,
      corteData.Total_Transferencia,
      corteData.Total_Caja,
      corteData.Responsable,
      corteData.Observaciones,
      corteData.ID_Usuario
    ];
    
    console.log('📄 SQL:', sql);
    console.log('📄 Valores:', values);
    
    const [result] = await db.promise.query(sql, values);
    console.log('✅ Corte insertado con ID:', result.insertId);
    
    // Retornar el corte creado con el ID
    return {
      ID_Caja: result.insertId,
      ...corteData
    };
  } catch (error) {
    console.error('❌ Error en insertarCorte:', error);
    throw error;
  }
}

async function actualizarCaja(id, cajaData) {
  try {
    console.log(`🔄 Actualizando caja ${id}:`, cajaData);
    
    const sql = `
      UPDATE caja 
      SET Fecha_Corte = ?, Total_Efectivo = ?, Total_Transferencia = ?, 
          Total_Caja = ?, Responsable = ?, Observaciones = ?, ID_Usuario = ?
      WHERE ID_Caja = ?
    `;
    
    const values = [
      cajaData.Fecha_Corte,
      cajaData.Total_Efectivo,
      cajaData.Total_Transferencia,
      cajaData.Total_Caja,
      cajaData.Responsable,
      cajaData.Observaciones,
      cajaData.ID_Usuario,
      id
    ];
    
    await db.promise.query(sql, values);
    console.log('✅ Caja actualizada correctamente');
    
    return await buscarPorId(id);
  } catch (error) {
    console.error('❌ Error en actualizarCaja:', error);
    throw error;
  }
}

async function obtenerCajaActiva() {
  try {
    console.log('🔍 Buscando caja activa...');
    
    const sql = 'SELECT * FROM caja WHERE Estado = "Abierta" ORDER BY Fecha_Corte DESC LIMIT 1';
    const [rows] = await db.promise.query(sql);
    
    if (rows.length > 0) {
      console.log('✅ Caja activa encontrada');
      return rows[0];
    } else {
      console.log('❌ No se encontró caja activa');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en obtenerCajaActiva:', error);
    throw error;
  }
}

module.exports = {
  listarCajas,
  buscarPorId,
  buscarPorFecha,
  insertarCorte,
  actualizarCaja,
  obtenerCajaActiva
};
