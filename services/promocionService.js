async function listarPromocionesActivas() {
  const hoy = new Date().toISOString().slice(0, 10);
  const promociones = await promocionRepository.buscarActivasPorFecha(hoy);
  for (const promo of promociones) {
    promo.productos = await promocionProductoRepository.buscarPorPromocion(promo.ID_Promocion);
  }
  return promociones;
}

module.exports.listarPromocionesActivas = listarPromocionesActivas;
const promocionRepository = require('../repositories/promocionRepository');
const promocionProductoRepository = require('../repositories/promocionProductoRepository');

async function crearPromocion(data) {
  // Validar fechas y tipo
  if (!data.Fecha_Inicio || !data.Fecha_Fin || !data.Tipo) {
    throw new Error('Fechas y tipo son obligatorios');
  }
  if (new Date(data.Fecha_Inicio) > new Date(data.Fecha_Fin)) {
    throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin');
  }

  // Registrar promoción
  const promocion = await promocionRepository.insertarPromocion(data);

  // Asignar productos a la promoción
  if (Array.isArray(data.productos)) {
    for (const prod of data.productos) {
      await promocionProductoRepository.insertarPromocionProducto({
        ID_Promocion: promocion.ID_Promocion,
        ID_Producto: prod.ID_Producto,
        Cantidad: prod.Cantidad
      });
    }
  }

  return promocion;
}

module.exports = { crearPromocion };
