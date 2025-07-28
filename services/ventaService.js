
const ventaRepository = require('../repositories/ventaRepository');
const detalleVentaRepository = require('../repositories/detalleVentaRepository');
const productosRepository = require('../repositories/productosRepository');
const cajaRepository = require('../repositories/cajaRepository');

async function obtenerVentaConDetalle(id) {
  const venta = await ventaRepository.buscarPorId(id);
  if (!venta) return null;
  const detalle = await detalleVentaRepository.buscarPorVenta(id);
  venta.detalle = detalle;
  return venta;
}

async function obtenerVentaPorId(id) {
  return await obtenerVentaConDetalle(id);
}

async function crearVenta(data, usuario) {
  try {
    console.log('📤 Creando venta con datos:', data);
    
    // Buscar caja activa (o usar una por defecto)
    let cajaActiva;
    try {
      cajaActiva = await cajaRepository.obtenerCajaActiva();
      console.log('✅ Caja activa encontrada:', cajaActiva);
    } catch (error) {
      console.log('⚠️ No hay caja activa, usando caja por defecto');
      cajaActiva = { ID_Caja: 1 };
    }

    // Calcular el total de la venta
    let montoTotal = 0;
    const detalleList = [];
    
    console.log('🔍 Procesando productos...');
    for (const item of data.productos) {
      console.log(`📦 Procesando producto ${item.producto_id}, cantidad: ${item.cantidad}`);
      
      // Obtener el producto y su precio
      const producto = await productosRepository.buscarPorId(item.producto_id);
      if (!producto) {
        throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
      }
      
      console.log(`💰 Producto encontrado: ${producto.Nombre}, precio: ${producto.Precio_Venta}`);
      
      const precioUnitario = producto.Precio_Venta;
      const subtotal = precioUnitario * item.cantidad;
      montoTotal += subtotal;
      
      detalleList.push({
        ID_Producto: item.producto_id,
        Cantidad: item.cantidad,
        Precio_Unitario: precioUnitario,
        Subtotal: subtotal
      });
      
      console.log(`✅ Producto procesado: subtotal = $${subtotal}`);
    }

    console.log(`💰 Total de la venta: $${montoTotal}`);

    // Registrar venta
    const ventaData = {
      Fecha_Venta: new Date(),
      Monto_Total: montoTotal,
      Forma_Pago: data.forma_pago,
      ID_Caja: cajaActiva.ID_Caja,
      ID_Usuario: usuario.ID_Usuario
    };
    
    console.log('📤 Insertando venta principal...');
    const venta = await ventaRepository.insertarVenta(ventaData);
    console.log('✅ Venta principal insertada:', venta);

    // Registrar detalle y descontar stock
    console.log('📤 Insertando detalles de venta...');
    for (const detalle of detalleList) {
      console.log(`📦 Insertando detalle: ${detalle.ID_Producto} x ${detalle.Cantidad}`);
      
      await detalleVentaRepository.insertarDetalle({
        ID_Venta: venta.ID_Venta,
        ...detalle
      });
      
      console.log(`📦 Descontando stock del producto ${detalle.ID_Producto}...`);
      await productosRepository.descontarStock(detalle.ID_Producto, detalle.Cantidad);
    }

    console.log('✅ Venta completada exitosamente');
    return venta;
  } catch (error) {
    console.error('❌ Error en crearVenta:', error);
    throw error;
  }
}

async function registrarVenta(productos, forma_pago) {
  try {
    console.log('📤 Registrando venta con productos:', productos);
    console.log('📤 Forma de pago:', forma_pago);
    
    // Usar la función crearVenta que maneja los detalles
    const ventaData = {
      productos: productos,
      forma_pago: forma_pago
    };
    
    // Usuario temporal (en un sistema real vendría del token JWT)
    const usuario = {
      ID_Usuario: 1
    };
    
    const venta = await crearVenta(ventaData, usuario);
    console.log('✅ Venta registrada exitosamente:', venta);
    
    return venta;
  } catch (error) {
    console.error('❌ Error en registrarVenta:', error);
    throw error;
  }
}

async function obtenerHistorialVentas(tipoPago = '', pagina = 1, porPagina = 30) {
  return await ventaRepository.obtenerHistorialVentas(tipoPago, pagina, porPagina);
}

async function obtenerDetalleVenta(id) {
  return await obtenerVentaConDetalle(id);
}

module.exports = {
  crearVenta,
  obtenerVentaConDetalle,
  obtenerVentaPorId,
  registrarVenta,
  obtenerHistorialVentas,
  obtenerDetalleVenta
};
