const db = require('../config/db');

function buscarActivasPorFecha(fecha) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM promocion WHERE LOWER(Activo) = "1" AND Fecha_Inicio <= ? AND Fecha_Fin >= ?`;
    console.log('Promocion SQL:', sql);
    console.log('Promocion Params:', [fecha, fecha]);
    db.query(sql, [fecha, fecha], (err, results) => {
      if (err) {
        console.error('Promocion DB Error:', err);
        return reject(err);
      }
      console.log('Promocion Results:', results);
      resolve(results);
    });
  });
}

function insertarPromocion(data) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO promocion (Descripcion, Fecha_Inicio, Fecha_Fin, Activo, Tipo, Descuento_Porcentual, Precio_Promocional) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      data.Descripcion,
      data.Fecha_Inicio,
      data.Fecha_Fin,
      data.Activo !== undefined ? data.Activo : 1,
      data.Tipo,
      data.Descuento_Porcentual || null,
      data.Precio_Promocional || null
    ];
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ ID_Promocion: result.insertId, ...data });
    });
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM promocion WHERE ID_Promocion = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

module.exports = {
  buscarActivasPorFecha,
  insertarPromocion,
  buscarPorId
};
