const db = require('../config/db');

async function insertarVenta(ventaData) {
  try {
    console.log('📤 Insertando venta:', ventaData);
    
    const sql = 'INSERT INTO venta (Fecha_Venta, Monto_Total, Forma_Pago, ID_Caja, ID_Usuario) VALUES (?, ?, ?, ?, ?)';
    const values = [
      ventaData.Fecha_Venta || new Date(),
      ventaData.Monto_Total || 0,
      ventaData.Forma_Pago,
      ventaData.ID_Caja || 1,
      ventaData.ID_Usuario || 1
    ];
    
    console.log('📄 SQL:', sql);
    console.log('📄 Valores:', values);
    
    const [result] = await db.promise.query(sql, values);
    console.log('✅ Venta insertada con ID:', result.insertId);
    
    return { ID_Venta: result.insertId, ...ventaData };
  } catch (error) {
    console.error('❌ Error en insertarVenta:', error);
    throw error;
  }
}

function registrarVenta(productos, forma_pago) {
  return new Promise(async (resolve, reject) => {
    try {
      const connection = await db.promise.getConnection(); // Use promise-based connection
      try {
        await connection.beginTransaction();
        const ventaSql = 'INSERT INTO venta (Fecha_Venta, Monto_Total, Forma_Pago, ID_Caja, ID_Usuario) VALUES (NOW(), ?, ?, 1, 1)'; // Corrected columns
        const [ventaResult] = await connection.query(ventaSql, [0, forma_pago]); // Use connection.query directly
        const ventaId = ventaResult.insertId;
        
        let totalVenta = 0;
        
        for (const producto of productos) {
          // Obtener información del producto
          const [productoRows] = await connection.query('SELECT Precio_Venta, Stock_Total FROM producto WHERE ID_Producto = ?', [producto.producto_id]);
          if (productoRows.length === 0) {
            throw new Error(`Producto con ID ${producto.producto_id} no encontrado`);
          }
          
          const productoInfo = productoRows[0];
          const subtotal = productoInfo.Precio_Venta * producto.cantidad;
          totalVenta += subtotal;
          
          // Insertar detalle de venta
          const detalleSql = 'INSERT INTO detalleventa (ID_Venta, ID_Producto, Cantidad, Precio_Unitario, Subtotal) VALUES (?, ?, ?, ?, ?)';
          await connection.query(detalleSql, [ventaId, producto.producto_id, producto.cantidad, productoInfo.Precio_Venta, subtotal]);
          
          // Actualizar stock del producto
          const nuevoStock = productoInfo.Stock_Total - producto.cantidad;
          if (nuevoStock < 0) {
            throw new Error(`Stock insuficiente para el producto ${producto.producto_id}`);
          }
          await connection.query('UPDATE producto SET Stock_Total = ? WHERE ID_Producto = ?', [nuevoStock, producto.producto_id]);
        }
        
        // Actualizar el total de la venta
        await connection.query('UPDATE venta SET Monto_Total = ? WHERE ID_Venta = ?', [totalVenta, ventaId]); // Corrected column
        await connection.commit();
        
        // Obtener la venta completa
        const [ventaRows] = await connection.query('SELECT * FROM venta WHERE ID_Venta = ?', [ventaId]);
        resolve(ventaRows[0]);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function obtenerHistorialVentas(tipoPago = '', pagina = 1, porPagina = 30) {
  try {
    console.log('🔍 Obteniendo historial de ventas...');
    console.log('📊 Tipo de pago:', tipoPago);
    console.log('📊 Página:', pagina);
    console.log('📊 Por página:', porPagina);
    
    let sql = `
      SELECT v.ID_Venta, v.Fecha_Venta, v.Monto_Total, v.Forma_Pago,
             COUNT(dv.ID_Detalle) as Cantidad_Productos
      FROM venta v
      LEFT JOIN detalleventa dv ON v.ID_Venta = dv.ID_Venta
    `;
    
    const params = [];
    
    // Aplicar filtro por tipo de pago
    if (tipoPago && tipoPago !== 'todos') {
      sql += ' WHERE v.Forma_Pago = ?';
      params.push(tipoPago);
    }
    
    sql += ' GROUP BY v.ID_Venta, v.Fecha_Venta, v.Monto_Total, v.Forma_Pago';
    
    // Ordenamiento fijo por fecha más reciente
    sql += ' ORDER BY v.Fecha_Venta DESC';
    
    // Calcular offset para paginación
    const offset = (pagina - 1) * porPagina;
    sql += ' LIMIT ? OFFSET ?';
    params.push(porPagina, offset);
    
    console.log('📄 SQL:', sql);
    console.log('📄 Parámetros:', params);
    
    const [results] = await db.promise.query(sql, params);
    console.log(`✅ Historial obtenido: ${results.length} ventas`);
    
    // Obtener total de registros para paginación
    let countSql = `
      SELECT COUNT(DISTINCT v.ID_Venta) as total
      FROM venta v
    `;
    
    const countParams = [];
    if (tipoPago && tipoPago !== 'todos') {
      countSql += ' WHERE v.Forma_Pago = ?';
      countParams.push(tipoPago);
    }
    
    const [countResult] = await db.promise.query(countSql, countParams);
    const totalRegistros = countResult[0].total;
    const totalPaginas = Math.ceil(totalRegistros / porPagina);
    
    console.log(`📊 Total registros: ${totalRegistros}, Total páginas: ${totalPaginas}`);
    
    // Log de las primeras ventas para debugging
    results.slice(0, 3).forEach((venta, index) => {
      console.log(`📊 Venta ${index + 1}:`, {
        ID: venta.ID_Venta,
        Fecha: venta.Fecha_Venta,
        Total: venta.Monto_Total,
        Productos: venta.Cantidad_Productos,
        TipoPago: venta.Forma_Pago
      });
    });
    
    return {
      ventas: results,
      paginacion: {
        paginaActual: pagina,
        totalPaginas: totalPaginas,
        totalRegistros: totalRegistros,
        porPagina: porPagina
      }
    };
  } catch (error) {
    console.error('❌ Error en obtenerHistorialVentas:', error);
    throw error;
  }
}

async function buscarPorId(id) {
  try {
    console.log(`🔍 Buscando venta por ID: ${id}`);
    
    const sql = 'SELECT * FROM venta WHERE ID_Venta = ?';
    const [results] = await db.promise.query(sql, [id]);
    
    if (results.length > 0) {
      console.log('✅ Venta encontrada:', results[0]);
      return results[0];
    } else {
      console.log('❌ Venta no encontrada');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en buscarPorId:', error);
    throw error;
  }
}

module.exports = {
  insertarVenta,
  registrarVenta,
  obtenerHistorialVentas,
  buscarPorId
};
