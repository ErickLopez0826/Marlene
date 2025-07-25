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
    const productoActualizado = await productosService.editarProducto(id, req.body);
    res.json(productoActualizado);
  } catch (error) {
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
