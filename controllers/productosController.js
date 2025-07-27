exports.editarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el producto existe y está activo
    const producto = await productosService.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    if (!producto.Activo) {
      return res.status(400).json({ message: 'Solo se pueden editar productos activos' });
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
    console.error(error);
    res.status(500).json({ message: 'Error al editar producto', error });
  }
};
exports.crearProducto = async (req, res) => {
  const { Nombre, Precio_Venta, ID_Proveedor } = req.body;
  if (!Nombre || !Precio_Venta || !ID_Proveedor) {
    return res.status(400).json({ message: 'Nombre, precio y proveedor son obligatorios' });
  }
  try {
    const nuevoProducto = await productosService.crearProducto(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(error); // Log del error real
    res.status(500).json({ message: 'Error al crear producto', error });
  }
};
exports.getProductoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await productosService.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error });
  }
};
const productosService = require('../services/productosService');

exports.getProductosActivos = async (req, res) => {
  try {
    const productos = await productosService.obtenerProductosActivos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error });
  }
};
