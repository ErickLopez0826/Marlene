const promocionRepository = require('../repositories/promocionRepository');
const promocionProductoRepository = require('../repositories/promocionProductoRepository');

async function obtenerPromociones() {
  try {
    console.log('🔍 Obteniendo promociones desde el servicio...');
    
    const promociones = await promocionRepository.listarTodas();
    console.log(`📊 Promociones obtenidas: ${promociones.length}`);
    
    // Cargar productos asociados para cada promoción
    for (let promocion of promociones) {
      try {
        const productos = await promocionProductoRepository.buscarProductosPorPromocion(promocion.ID_Promocion);
        promocion.productos = productos;
      } catch (error) {
        console.log(`⚠️ Error al cargar productos para promoción ${promocion.ID_Promocion}:`, error.message);
        promocion.productos = [];
      }
    }
    
    return promociones;
  } catch (error) {
    console.error('❌ Error en obtenerPromociones:', error);
    throw error;
  }
}

async function listarPromocionesActivas() {
  try {
    console.log('🔍 Obteniendo promociones activas desde el servicio...');
    
    const hoy = new Date().toISOString().slice(0, 10);
    const promociones = await promocionRepository.buscarActivasPorFecha(hoy);
    console.log(`📊 Promociones activas obtenidas: ${promociones.length}`);
    
    return promociones;
  } catch (error) {
    console.error('❌ Error en listarPromocionesActivas:', error);
    throw error;
  }
}

async function crearPromocion(data, productos) {
  try {
    console.log('📤 Creando nueva promoción desde el servicio...');
    console.log('📄 Datos de promoción:', data);
    console.log('📄 Productos seleccionados:', productos);
    
    // Validar fechas y tipo
    if (!data.Fecha_Inicio || !data.Fecha_Fin || !data.Tipo) {
      throw new Error('Fechas y tipo son obligatorios');
    }
    if (new Date(data.Fecha_Inicio) > new Date(data.Fecha_Fin)) {
      throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin');
    }

    // Registrar promoción
    const promocion = await promocionRepository.insertarPromocion(data);
    console.log('✅ Promoción creada con ID:', promocion.ID_Promocion);

    // Asignar productos a la promoción si se proporcionaron
    if (productos && productos.length > 0) {
      console.log('📦 Asignando productos a la promoción...');
      for (let productoId of productos) {
        await promocionProductoRepository.insertarPromocionProducto(promocion.ID_Promocion, productoId);
      }
      console.log(`✅ ${productos.length} productos asignados a la promoción`);
    }
    
    console.log('✅ Promoción creada exitosamente');
    return promocion;
  } catch (error) {
    console.error('❌ Error en crearPromocion:', error);
    throw error;
  }
}

async function obtenerPromocionPorId(id) {
  try {
    console.log(`🔍 Obteniendo promoción ${id} desde el servicio...`);
    
    const promocion = await promocionRepository.buscarPorId(id);
    if (promocion) {
      console.log('✅ Promoción encontrada');
    } else {
      console.log('❌ Promoción no encontrada');
    }
    
    return promocion;
  } catch (error) {
    console.error('❌ Error en obtenerPromocionPorId:', error);
    throw error;
  }
}

async function togglePromocion(id, activo) {
  try {
    console.log(`🔄 Cambiando estado de promoción ${id} a ${activo ? 'activa' : 'inactiva'}`);
    
    const promocion = await promocionRepository.actualizarPromocion(id, { Activo: activo ? 1 : 0 });
    console.log('✅ Estado de promoción actualizado');
    
    return promocion;
  } catch (error) {
    console.error('❌ Error en togglePromocion:', error);
    throw error;
  }
}

async function eliminarPromocion(id) {
  try {
    console.log(`🗑️ Eliminando promoción ${id} desde el servicio...`);
    
    // Primero eliminar productos asociados
    await promocionProductoRepository.eliminarPorPromocion(id);
    console.log('✅ Productos asociados eliminados');
    
    // Luego eliminar la promoción
    const resultado = await promocionRepository.eliminarPromocion(id);
    console.log('✅ Promoción eliminada de la base de datos');
    
    return resultado;
  } catch (error) {
    console.error('❌ Error en eliminarPromocion:', error);
    throw error;
  }
}

module.exports = {
  obtenerPromociones,
  listarPromocionesActivas,
  crearPromocion,
  obtenerPromocionPorId,
  togglePromocion,
  eliminarPromocion
};
