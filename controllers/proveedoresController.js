const proveedoresService = require('../services/proveedoresService');

exports.getProveedores = async (req, res) => {
  try {
    const proveedores = await proveedoresService.obtenerProveedores();
    res.json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener proveedores', error });
  }
}; 