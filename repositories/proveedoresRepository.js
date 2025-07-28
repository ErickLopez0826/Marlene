const db = require('../config/db');

function listarTodos() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ID_Proveedor, Nombre, Telefono, Dia_Surtido FROM proveedor ORDER BY Nombre';
    db.pool.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = {
  listarTodos
}; 