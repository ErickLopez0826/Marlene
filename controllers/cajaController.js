const cajaService = require('../services/cajaService');

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

exports.getCortePorId = async (req, res) => {
  const { id } = req.params;
  try {
    const corte = await cajaService.buscarPorId(id);
    if (!corte) {
      return res.status(404).json({ message: 'No hay corte registrado para ese ID' });
    }
    res.json(corte);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar corte de caja', error });
  }
};

exports.registrarCorte = async (req, res) => {
  try {
    const corte = await cajaService.registrarCorte(req.body, req.user);
    res.status(201).json(corte);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar corte de caja', error });
  }
};
