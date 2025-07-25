function listarMovimientos(tipo, producto) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM inventario WHERE 1=1';
    const params = [];
    console.log('--- INICIO listarMovimientos ---');
    console.log('Tipo:', tipo, 'Producto:', producto);
    if (tipo) {
      sql += ' AND LOWER(Tipo_Movimiento) = ?';
      params.push(tipo.toLowerCase());
    }
    if (producto) {
      sql += ' AND ID_Producto = ?';
      params.push(producto);
    }
    console.log('Inventario SQL:', sql);
    console.log('Inventario Params:', params);
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('Inventario DB Error:', err);
        return reject(err);
      }
      console.log('Inventario Results:', results);
      console.log('--- FIN listarMovimientos ---');
      resolve(results);
    });
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM inventario WHERE ID_Inventario = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

function insertarMovimiento(movimientoData) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO inventario (ID_Producto, Tipo_Movimiento, Cantidad, Fecha_Movimiento, Observaciones, ID_Usuario) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
      movimientoData.ID_Producto,
      movimientoData.Tipo_Movimiento,
      movimientoData.Cantidad,
      movimientoData.Fecha_Movimiento,
      movimientoData.Observaciones,
      movimientoData.ID_Usuario
    ];
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ ID_Inventario: result.insertId, ...movimientoData });
    });
  });
}

const db = require('../config/db');

function registrarSalida(ID_Producto, cantidad, ID_Venta) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO inventario (ID_Producto, Movimiento, Cantidad, Referencia) VALUES (?, 'SALIDA', ?, ?)`;
    db.query(sql, [ID_Producto, cantidad, ID_Venta], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

module.exports = {
  listarMovimientos,
  buscarPorId,
  insertarMovimiento,
  registrarSalida
};
