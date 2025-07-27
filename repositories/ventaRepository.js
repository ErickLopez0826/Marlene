const db = require('../config/db');

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    console.log('Venta SQL:', 'SELECT * FROM venta WHERE ID_Venta = ?', 'ID:', id);
    db.query('SELECT * FROM venta WHERE ID_Venta = ?', [id], (err, results) => {
      if (err) {
        console.error('Venta DB Error:', err);
        return reject(err);
      }
      console.log('Venta Results:', results);
      resolve(results[0]);
    });
  });
}

function insertarVenta(ventaData) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO venta (Fecha_Venta, Monto_Total, Forma_Pago, ID_Caja, ID_Usuario) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      ventaData.Fecha_Venta,
      ventaData.Monto_Total,
      ventaData.Forma_Pago,
      ventaData.ID_Caja,
      ventaData.ID_Usuario
    ];
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ ID_Venta: result.insertId, ...ventaData });
    });
  });
}

module.exports = {
  buscarPorId,
  insertarVenta
};
