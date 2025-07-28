const db = require('../config/db');

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

function actualizarProducto(id, productoData) {
  return new Promise((resolve, reject) => {
    const campos = [];
    const valores = [];
    for (const key in productoData) {
      if (productoData.hasOwnProperty(key)) {
        campos.push(`${key} = ?`);
        valores.push(productoData[key]);
      }
    }
    if (campos.length === 0) return resolve(null);
    const sql = `UPDATE producto SET ${campos.join(', ')} WHERE ID_Producto = ? AND Activo = 1`;
    valores.push(id);
    db.pool.query(sql, valores, (err, result) => {
      if (err) return reject(err);
      resolve({ ID_Producto: id, ...productoData });
    });
  });
}

function insertarProducto(productoData) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO producto (Nombre, Marca, Presentacion, Precio_Venta, Precio_Compra, Stock_Total, Activo, Fecha_Caducidad, ID_Proveedor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      productoData.Nombre,
      productoData.Marca || null,
      productoData.Presentacion || null,
      productoData.Precio_Venta !== undefined ? productoData.Precio_Venta : 0,
      productoData.Precio_Compra !== undefined ? productoData.Precio_Compra : null,
      productoData.Stock_Total !== undefined ? productoData.Stock_Total : 0,
      productoData.Activo !== undefined ? productoData.Activo : 1,
      productoData.Fecha_Caducidad || null,
      productoData.ID_Proveedor
    ];
    db.pool.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ ID_Producto: result.insertId, ...productoData });
    });
  });
}

async function buscarPorId(id) {
  try {
    console.log(`🔍 Buscando producto por ID: ${id}`);
    
    const [results] = await db.promise.query('SELECT * FROM producto WHERE ID_Producto = ?', [id]);
    
    if (results.length > 0) {
      console.log('✅ Producto encontrado:', results[0].Nombre);
      return results[0];
    } else {
      console.log('❌ Producto no encontrado');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en buscarPorId:', error);
    throw error;
  }
}

function listarActivos() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.*, pr.Nombre as Nombre_Proveedor 
      FROM producto p 
      LEFT JOIN proveedor pr ON p.ID_Proveedor = pr.ID_Proveedor 
      WHERE LOWER(p.Activo) = "1"
    `;
    db.pool.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = {
  aumentarStock,
  descontarStock,
  actualizarProducto,
  insertarProducto,
  buscarPorId,
  listarActivos
};
