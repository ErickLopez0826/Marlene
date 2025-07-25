function buscarPorVenta(ID_Venta) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM detalleventa WHERE ID_Venta = ?', [ID_Venta], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports.buscarPorVenta = buscarPorVenta;
const db = require('../config/db');

function insertarDetalle(detalleData) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO detalleventa (ID_Venta, ID_Producto, Cantidad, Precio_Unitario, Subtotal) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      detalleData.ID_Venta,
      detalleData.ID_Producto,
      detalleData.Cantidad,
      detalleData.Precio_Unitario,
      detalleData.Subtotal
    ];
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ ID_Detalle: result.insertId, ...detalleData });
    });
  });
}

module.exports = { insertarDetalle };
