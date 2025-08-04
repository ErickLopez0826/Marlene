const db = require('../config/db');

// Este método ejecuta el procedimiento almacenado: `CALL ListarProductos()`
async function listarProductos() {
  try {
    console.log('🔍 Ejecutando procedimiento: CALL ListarProductos()');
    
    const [results] = await db.promise.execute('CALL ListarProductos()');
    
    console.log(`✅ Productos obtenidos: ${results[0].length}`);
    return results[0]; // Los procedimientos almacenados retornan el resultado en results[0]
  } catch (error) {
    console.error('❌ Error en listarProductos:', error);
    throw error;
  }
}

// Este método ejecuta el procedimiento almacenado: `CALL ObtenerProducto(?)`
async function obtenerProducto(id) {
  try {
    console.log(`🔍 Ejecutando procedimiento: CALL ObtenerProducto(${id})`);
    
    const [results] = await db.promise.execute('CALL ObtenerProducto(?)', [id]);
    
    if (results[0].length > 0) {
      console.log('✅ Producto encontrado:', results[0][0].Nombre);
      return results[0][0];
    } else {
      console.log('❌ Producto no encontrado');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en obtenerProducto:', error);
    throw error;
  }
}

// Este método ejecuta el procedimiento almacenado: `CALL InsertarProducto(?, ?, ?, ?, ?, ?, ?, ?, ?)`
async function insertarProducto(productoData) {
  try {
    console.log('🔍 Ejecutando procedimiento: CALL InsertarProducto(...)');
    
    const [results] = await db.promise.execute(
      'CALL InsertarProducto(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        productoData.Nombre,
        productoData.Marca || null,
        productoData.Presentacion || null,
        productoData.Precio_Venta !== undefined ? productoData.Precio_Venta : 0,
        productoData.Precio_Compra !== undefined ? productoData.Precio_Compra : null,
        productoData.Stock_Total !== undefined ? productoData.Stock_Total : 0,
        productoData.Activo !== undefined ? productoData.Activo : 1,
        productoData.Fecha_Caducidad || null,
        productoData.ID_Proveedor
      ]
    );
    
    console.log('✅ Producto insertado exitosamente');
    return { ID_Producto: results[0][0].ID_Producto, ...productoData };
  } catch (error) {
    console.error('❌ Error en insertarProducto:', error);
    throw error;
  }
}

// Este método ejecuta el procedimiento almacenado: `CALL ActualizarProducto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
async function actualizarProducto(id, productoData) {
  try {
    console.log(`🔍 Ejecutando procedimiento: CALL ActualizarProducto(${id}, ...)`);
    
    const [results] = await db.promise.execute(
      'CALL ActualizarProducto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        productoData.Nombre,
        productoData.Marca || null,
        productoData.Presentacion || null,
        productoData.Precio_Venta !== undefined ? productoData.Precio_Venta : 0,
        productoData.Precio_Compra !== undefined ? productoData.Precio_Compra : null,
        productoData.Stock_Total !== undefined ? productoData.Stock_Total : 0,
        productoData.Activo !== undefined ? productoData.Activo : 1,
        productoData.Fecha_Caducidad || null,
        productoData.ID_Proveedor
      ]
    );
    
    console.log('✅ Producto actualizado exitosamente');
    return { ID_Producto: id, ...productoData };
  } catch (error) {
    console.error('❌ Error en actualizarProducto:', error);
    throw error;
  }
}

// Este método ejecuta el procedimiento almacenado: `CALL EliminarProducto(?)`
async function eliminarProducto(id) {
  try {
    console.log(`🔍 Ejecutando procedimiento: CALL EliminarProducto(${id})`);
    
    const [results] = await db.promise.execute('CALL EliminarProducto(?)', [id]);
    
    console.log('✅ Producto eliminado exitosamente');
    return { success: true, ID_Producto: id };
  } catch (error) {
    console.error('❌ Error en eliminarProducto:', error);
    throw error;
  }
}

// Métodos auxiliares para gestión de stock (mantenidos por compatibilidad)
async function aumentarStock(ID_Producto, cantidad) {
  try {
    console.log(`📈 Aumentando stock del producto ${ID_Producto} en ${cantidad}`);
    
    const sql = 'UPDATE producto SET Stock_Total = Stock_Total + ? WHERE ID_Producto = ?';
    const [result] = await db.promise.query(sql, [cantidad, ID_Producto]);
    
    console.log('✅ Stock aumentado exitosamente');
    return result;
  } catch (error) {
    console.error('❌ Error en aumentarStock:', error);
    throw error;
  }
}

async function descontarStock(ID_Producto, cantidad) {
  try {
    console.log(`📉 Descontando stock del producto ${ID_Producto} en ${cantidad}`);
    
    const sql = 'UPDATE producto SET Stock_Total = Stock_Total - ? WHERE ID_Producto = ?';
    const [result] = await db.promise.query(sql, [cantidad, ID_Producto]);
    
    console.log('✅ Stock descontado exitosamente');
    return result;
  } catch (error) {
    console.error('❌ Error en descontarStock:', error);
    throw error;
  }
}

module.exports = {
  listarProductos,
  obtenerProducto,
  insertarProducto,
  actualizarProducto,
  eliminarProducto,
  aumentarStock,
  descontarStock
};
