const promocionService = require('../services/promocionService');

exports.getPromociones = async (req, res) => {
  try {
    const promociones = await promocionService.obtenerPromociones();
    res.json(promociones);
  } catch (error) {
    console.error('Error en getPromociones:', error);
    res.status(500).json({ message: 'Error al consultar promociones', error: error.message });
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
    console.error('Error en getPromocionPorId:', error);
    res.status(500).json({ message: 'Error al consultar promoción', error: error.message });
  }
};

exports.crearPromocion = async (req, res) => {
  try {
    const { descripcion, fecha_inicio, fecha_fin, tipo, valor, observaciones, productos } = req.body;
    
    if (!descripcion || !fecha_inicio || !fecha_fin || !tipo) {
      return res.status(400).json({ 
        message: 'Descripción, fecha de inicio, fecha de fin y tipo son obligatorios' 
      });
    }

    // Preparar datos según el tipo de promoción
    const promocionData = {
      Descripcion: descripcion,
      Fecha_Inicio: fecha_inicio,
      Fecha_Fin: fecha_fin,
      Tipo: tipo,
      Activo: 1
    };

    // Asignar valor según el tipo
    if (tipo === 'Porcentaje') {
      promocionData.Descuento_Porcentual = valor;
      promocionData.Precio_Promocional = null;
    } else if (tipo === 'Promocional') {
      promocionData.Precio_Promocional = valor;
      promocionData.Descuento_Porcentual = null;
    } else if (tipo === '2x1' || tipo === '3x2') {
      // Para promociones tipo 2x1 y 3x2, no necesitamos valor específico
      promocionData.Descuento_Porcentual = null;
      promocionData.Precio_Promocional = null;
    } else {
      // Para otros tipos, usar Descuento_Porcentual por defecto
      promocionData.Descuento_Porcentual = valor;
      promocionData.Precio_Promocional = null;
    }

    const promocion = await promocionService.crearPromocion(promocionData, productos);
    res.status(201).json(promocion);
  } catch (error) {
    console.error('Error en crearPromocion:', error);
    res.status(500).json({ message: 'Error al registrar promoción', error: error.message });
  }
};

exports.togglePromocion = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    
    console.log(`Cambiando estado de promoción ${id} a ${activo ? 'activa' : 'inactiva'}`);
    
    const promocion = await promocionService.togglePromocion(id, activo);
    res.json(promocion);
  } catch (error) {
    console.error('Error en togglePromocion:', error);
    res.status(500).json({ message: 'Error al cambiar estado de promoción', error: error.message });
  }
};

exports.listarPromocionesActivas = async (req, res) => {
  try {
    const promociones = await promocionService.listarPromocionesActivas();
    res.json(promociones);
  } catch (error) {
    console.error('Error en listarPromocionesActivas:', error);
    res.status(500).json({ message: 'Error al consultar promociones', error: error.message });
  }
};

exports.eliminarPromocion = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Eliminando promoción ${id} de la base de datos...`);
    
    const resultado = await promocionService.eliminarPromocion(id);
    res.json({ message: 'Promoción eliminada correctamente', resultado });
  } catch (error) {
    console.error('Error en eliminarPromocion:', error);
    res.status(500).json({ message: 'Error al eliminar promoción', error: error.message });
  }
};
