const productosService = require('../services/productosService');

// Este endpoint obtiene todos los productos usando el procedimiento: CALL ListarProductos()
exports.getProductos = async (req, res) => {
  try {
    const productos = await productosService.obtenerTodosLosProductos();
    res.json(productos);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Este endpoint obtiene un producto por ID usando el procedimiento: CALL ObtenerProducto(?)
exports.getProductoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await productosService.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

// Este endpoint crea un nuevo producto usando el procedimiento: CALL InsertarProducto(...)
exports.crearProducto = async (req, res) => {
  const { Nombre, Precio_Venta, ID_Proveedor } = req.body;
  if (!Nombre || !Precio_Venta || !ID_Proveedor) {
    return res.status(400).json({ message: 'Nombre, precio y proveedor son obligatorios' });
  }
  try {
    const nuevoProducto = await productosService.crearProducto(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

// Este endpoint actualiza un producto usando el procedimiento: CALL ActualizarProducto(...)
exports.editarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el producto existe
    const producto = await productosService.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Mapeo de campos del body a los nombres de la base de datos
    const camposValidos = {
      Nombre: 'Nombre',
      Marca: 'Marca',
      Presentacion: 'Presentacion',
      Precio_Venta: 'Precio_Venta',
      Precio_Compra: 'Precio_Compra',
      Stock_Total: 'Stock_Total',
      Activo: 'Activo',
      Fecha_Caducidad: 'Fecha_Caducidad',
      ID_Proveedor: 'ID_Proveedor'
    };
    
    const productoData = {};
    for (const key in req.body) {
      if (camposValidos[key]) {
        productoData[camposValidos[key]] = req.body[key];
      }
    }
    
    if (Object.keys(productoData).length === 0) {
      return res.status(400).json({ message: 'No se enviaron campos válidos para actualizar' });
    }
    
    const productoActualizado = await productosService.editarProducto(id, productoData);
    res.json(productoActualizado);
  } catch (error) {
    console.error('❌ Error al editar producto:', error);
    res.status(500).json({ message: 'Error al editar producto', error: error.message });
  }
};

// Este endpoint elimina un producto usando el procedimiento: CALL EliminarProducto(?)
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el producto existe
    const producto = await productosService.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const resultado = await productosService.eliminarProducto(id);
    res.json({ message: 'Producto eliminado exitosamente', ...resultado });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};
