const db = require('../config/db');

async function buscarPorPromocion(ID_Promocion) {
  try {
    console.log(`🔍 Buscando productos para promoción ${ID_Promocion}...`);
    
    const sql = `
      SELECT pp.*, p.Nombre_Producto, p.Marca, p.Presentacion 
      FROM promocion_producto pp
      LEFT JOIN producto p ON pp.ID_Producto = p.ID_Producto
      WHERE pp.ID_Promocion = ?
    `;
    
    console.log('📄 SQL:', sql);
    console.log('📄 Parámetros:', [ID_Promocion]);
    
    const [rows] = await db.promise.query(sql, [ID_Promocion]);
    console.log('📊 Productos encontrados:', rows.length);
    
    return rows;
  } catch (error) {
    console.error('❌ Error en buscarPorPromocion:', error);
    throw error;
  }
}

async function buscarProductosPorPromocion(ID_Promocion) {
  try {
    console.log(`🔍 Buscando productos para promoción ${ID_Promocion}...`);
    
    const sql = `
      SELECT p.ID_Producto, p.Nombre as Nombre, p.Marca, p.Presentacion 
      FROM promocion_producto pp
      LEFT JOIN producto p ON pp.ID_Producto = p.ID_Producto
      WHERE pp.ID_Promocion = ?
    `;
    
    console.log('📄 SQL:', sql);
    console.log('📄 Parámetros:', [ID_Promocion]);
    
    const [rows] = await db.promise.query(sql, [ID_Promocion]);
    console.log('📊 Productos encontrados:', rows.length);
    console.log('📊 Productos:', rows);
    
    return rows;
  } catch (error) {
    console.error('❌ Error en buscarProductosPorPromocion:', error);
    throw error;
  }
}

async function insertarPromocionProducto(ID_Promocion, ID_Producto, Cantidad = 1) {
  try {
    console.log(`📤 Insertando producto ${ID_Producto} en promoción ${ID_Promocion}...`);
    
    const sql = `INSERT INTO promocion_producto (ID_Promocion, ID_Producto, Cantidad) VALUES (?, ?, ?)`;
    const values = [ID_Promocion, ID_Producto, Cantidad];
    
    console.log('📄 SQL:', sql);
    console.log('📄 Valores:', values);
    
    await db.promise.query(sql, values);
    console.log('✅ Producto insertado correctamente');
    
    return { ID_Promocion, ID_Producto, Cantidad };
  } catch (error) {
    console.error('❌ Error en insertarPromocionProducto:', error);
    throw error;
  }
}

async function eliminarPorPromocion(ID_Promocion) {
  try {
    console.log(`🗑️ Eliminando productos de promoción ${ID_Promocion}...`);
    
    await db.promise.query('DELETE FROM promocion_producto WHERE ID_Promocion = ?', [ID_Promocion]);
    console.log('✅ Productos eliminados correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error en eliminarPorPromocion:', error);
    throw error;
  }
}

async function buscarPorProducto(ID_Producto) {
  try {
    console.log(`🔍 Buscando promociones para producto ${ID_Producto}...`);
    
    const sql = `
      SELECT pp.*, pr.Descripcion, pr.Tipo, pr.Descuento_Porcent
      FROM promocion_producto pp
      LEFT JOIN promocion pr ON pp.ID_Promocion = pr.ID_Promocion
      WHERE pp.ID_Producto = ? AND pr.Activo = 1
    `;
    
    const [rows] = await db.promise.query(sql, [ID_Producto]);
    console.log('📊 Promociones encontradas:', rows.length);
    
    return rows;
  } catch (error) {
    console.error('❌ Error en buscarPorProducto:', error);
    throw error;
  }
}

module.exports = {
  buscarPorPromocion,
  buscarProductosPorPromocion,
  insertarPromocionProducto,
  eliminarPorPromocion,
  buscarPorProducto
};
