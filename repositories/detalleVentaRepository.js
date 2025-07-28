const db = require('../config/db');

async function buscarPorVenta(idVenta) {
  try {
    console.log(`🔍 Buscando detalles de venta ${idVenta}...`);
    
    const sql = `
      SELECT dv.*, p.Nombre as Nombre_Producto, p.Marca
      FROM detalleventa dv
      JOIN producto p ON dv.ID_Producto = p.ID_Producto
      WHERE dv.ID_Venta = ?
    `;
    
    const [results] = await db.promise.query(sql, [idVenta]);
    console.log(`✅ Detalles encontrados: ${results.length}`);
    
    return results;
  } catch (error) {
    console.error('❌ Error en buscarPorVenta:', error);
    throw error;
  }
}

async function insertarDetalle(detalleData) {
  try {
    console.log('📤 Insertando detalle de venta:', detalleData);
    
    const sql = 'INSERT INTO detalleventa (ID_Venta, ID_Producto, Cantidad, Precio_Unitario, Subtotal) VALUES (?, ?, ?, ?, ?)';
    const values = [
      detalleData.ID_Venta,
      detalleData.ID_Producto,
      detalleData.Cantidad,
      detalleData.Precio_Unitario,
      detalleData.Subtotal
    ];
    
    console.log('📄 SQL:', sql);
    console.log('📄 Valores:', values);
    
    const [result] = await db.promise.query(sql, values);
    console.log('✅ Detalle insertado con ID:', result.insertId);
    
    return { ID_Detalle: result.insertId, ...detalleData };
  } catch (error) {
    console.error('❌ Error en insertarDetalle:', error);
    throw error;
  }
}

module.exports = {
  buscarPorVenta,
  insertarDetalle
};
