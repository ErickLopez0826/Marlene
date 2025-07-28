const cajaService = require('../services/cajaService');

exports.getCortes = async (req, res) => {
  try {
    const cortes = await cajaService.listarCajas();
    res.json(cortes);
  } catch (error) {
    console.error('Error en getCortes:', error);
    res.status(500).json({ message: 'Error al consultar cortes de caja', error: error.message });
  }
};

exports.getCortePorFecha = async (req, res) => {
  const { fecha } = req.params;
  try {
    const corte = await cajaService.obtenerCortePorFecha(fecha);
    if (!corte) {
      return res.status(404).json({ message: 'No hay corte registrado para esa fecha' });
    }
    res.json(corte);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar corte de caja', error });
  }
};

exports.getCajaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const caja = await cajaService.obtenerCajaPorId(id);
    if (!caja) {
      return res.status(404).json({ message: 'Corte de caja no encontrado' });
    }
    res.json(caja);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar corte de caja', error });
  }
};

exports.registrarCorte = async (req, res) => {
  try {
    const corte = await cajaService.registrarCorte(req.body, req.user);
    res.status(201).json(corte);
  } catch (error) {
    console.error('Error en registrarCorte:', error);
    res.status(500).json({ message: 'Error al registrar corte de caja', error: error.message });
  }
};
