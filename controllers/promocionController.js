exports.listarPromocionesActivas = async (req, res) => {
  try {
    const promociones = await promocionService.listarPromocionesActivas();
    res.json(promociones);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar promociones', error });
  }
};
const promocionService = require('../services/promocionService');

exports.crearPromocion = async (req, res) => {
  try {
    const promocion = await promocionService.crearPromocion(req.body);
    res.status(201).json(promocion);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar promoción', error });
  }
};
