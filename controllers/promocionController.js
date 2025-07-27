exports.listarPromocionesActivas = async (req, res) => {
  try {
    const promociones = await promocionService.listarPromocionesActivas();
    res.json(promociones);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar promociones', error });
  }
};
const promocionService = require('../services/promocionService');

exports.getPromociones = async (req, res) => {
  try {
    const promociones = await promocionService.obtenerPromocionesActivas();
    res.json(promociones);
  } catch (error) {
    console.error(error); // Log del error real
    res.status(500).json({ message: 'Error al consultar promociones', error });
  }
};

exports.getPromocionPorId = async (req, res) => {
  try {
    const promo = await promocionService.obtenerPromocionPorId(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar promoción', error });
  }
};

exports.crearPromocion = async (req, res) => {
  const { Descripcion, Fecha_Inicio, Fecha_Fin, Activo, Tipo, Descuento_Porcentual, Precio_Promocional } = req.body;
  if (!Descripcion || !Fecha_Inicio || !Fecha_Fin || !Tipo) {
    return res.status(400).json({ message: 'Descripcion, Fecha_Inicio, Fecha_Fin y Tipo son obligatorios' });
  }
  try {
    const promocion = await promocionService.crearPromocion({
      Descripcion,
      Fecha_Inicio,
      Fecha_Fin,
      Activo: Activo !== undefined ? Activo : 1,
      Tipo,
      Descuento_Porcentual: Descuento_Porcentual !== undefined ? Descuento_Porcentual : null,
      Precio_Promocional: Precio_Promocional !== undefined ? Precio_Promocional : null
    });
    res.status(201).json(promocion);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar promoción', error });
  }
};
