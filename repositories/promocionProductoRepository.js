function buscarPorPromocion(ID_Promocion) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM promocionproducto WHERE ID_Promocion = ?', [ID_Promocion], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports.buscarPorPromocion = buscarPorPromocion;
const db = require('../config/db');

function insertarPromocionProducto(data) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO promocionproducto (ID_Promocion, ID_Producto, Cantidad) VALUES (?, ?, ?)`;
    const values = [data.ID_Promocion, data.ID_Producto, data.Cantidad];
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ ...data });
    });
  });
}

module.exports = { insertarPromocionProducto };
