function buscarPorFecha(fecha) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM caja WHERE DATE(Fecha_Corte) = ?', [fecha], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

module.exports.buscarPorFecha = buscarPorFecha;
function insertarCorte(corteData) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO caja (Fecha_Corte, Total_Efectivo, Total_Transferencia, Total_Caja, Responsable, Observaciones, ID_Usuario) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      corteData.Fecha_Corte,
      corteData.Total_Efectivo,
      corteData.Total_Transferencia,
      corteData.Total_Caja,
      corteData.Responsable,
      corteData.Observaciones,
      corteData.ID_Usuario
    ];
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ ID_Caja: result.insertId, ...corteData });
    });
  });
}

module.exports.insertarCorte = insertarCorte;
const db = require('../config/db');

function obtenerCajaActiva() {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM caja WHERE Activa = 1 LIMIT 1', (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM caja WHERE ID_Caja = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

module.exports = {
  obtenerCajaActiva,
  buscarPorId,
  buscarPorFecha,
  insertarCorte
};
