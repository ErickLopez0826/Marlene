const cajaRepository = require('../repositories/cajaRepository');

async function obtenerCortePorFecha(fecha) {
  try {
    console.log(`🔍 Obteniendo corte por fecha: ${fecha}`);
    return await cajaRepository.buscarPorFecha(fecha);
  } catch (error) {
    console.error('❌ Error en obtenerCortePorFecha:', error);
    throw error;
  }
}

async function registrarCorte(data, usuario) {
  try {
    console.log('📤 Registrando nuevo corte de caja:', data);
    
    const corteData = {
      Fecha_Corte: data.Fecha_Corte,
      Total_Efectivo: data.Total_Efectivo,
      Total_Transferencia: data.Total_Transferencia,
      Total_Caja: data.Total_Caja,
      Responsable: data.Responsable || usuario?.Nombre || 'Usuario',
      Observaciones: data.Observaciones || '',
      ID_Usuario: usuario?.ID_Usuario || 1
    };
    
    console.log('📄 Datos del corte:', corteData);
    
    const resultado = await cajaRepository.insertarCorte(corteData);
    console.log('✅ Corte registrado exitosamente');
    
    return resultado;
  } catch (error) {
    console.error('❌ Error en registrarCorte:', error);
    throw error;
  }
}

async function buscarPorId(id) {
  try {
    console.log(`🔍 Buscando caja por ID: ${id}`);
    return await cajaRepository.buscarPorId(id);
  } catch (error) {
    console.error('❌ Error en buscarPorId:', error);
    throw error;
  }
}

async function obtenerCajaPorId(id) {
  try {
    console.log(`🔍 Obteniendo caja por ID: ${id}`);
    return await buscarPorId(id);
  } catch (error) {
    console.error('❌ Error en obtenerCajaPorId:', error);
    throw error;
  }
}

async function listarCajas() {
  try {
    console.log('🔍 Listando todas las cajas...');
    return await cajaRepository.listarCajas();
  } catch (error) {
    console.error('❌ Error en listarCajas:', error);
    throw error;
  }
}

module.exports = {
  obtenerCortePorFecha,
  registrarCorte,
  buscarPorId,
  obtenerCajaPorId,
  listarCajas
};
