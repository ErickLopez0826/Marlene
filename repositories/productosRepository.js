function aumentarStock(ID_Producto, cantidad) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE producto SET Stock_Total = Stock_Total + ? WHERE ID_Producto = ?';
    db.query(sql, [cantidad, ID_Producto], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

const db = require('../config/db');


function descontarStock(ID_Producto, cantidad) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE producto SET Stock_Total = Stock_Total - ? WHERE ID_Producto = ?';
    db.query(sql, [cantidad, ID_Producto], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
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
    db.query(sql, valores, (err, result) => {
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
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ ID_Producto: result.insertId, ...productoData });
    });
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM producto WHERE ID_Producto = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

function listarActivos() {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM producto WHERE LOWER(Activo) = "1"', (err, results) => {
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
