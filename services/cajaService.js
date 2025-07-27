const cajaRepository = require('../repositories/cajaRepository');

async function obtenerCortePorFecha(fecha) {
  return await cajaRepository.buscarPorFecha(fecha);
}

module.exports.obtenerCortePorFecha = obtenerCortePorFecha;

async function registrarCorte(data, usuario) {
  const corteData = {
    Fecha_Corte: new Date(),
    Total_Efectivo: data.Total_Efectivo,
    Total_Transferencia: data.Total_Transferencia,
    Total_Caja: data.Total_Caja,
    Responsable: data.Responsable || usuario.Nombre,
    Observaciones: data.Observaciones || '',
    ID_Usuario: usuario.ID_Usuario
  };
  return await cajaRepository.insertarCorte(corteData);
}

module.exports = { registrarCorte };

async function buscarPorId(id) {
  return await cajaRepository.buscarPorId(id);
}

async function obtenerCajaPorId(id) {
  return await buscarPorId(id);
}

module.exports.buscarPorId = buscarPorId;
module.exports.obtenerCajaPorId = obtenerCajaPorId;
