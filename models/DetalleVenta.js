class DetalleVenta {
  constructor(ID_Detalle, ID_Venta, ID_Producto, Cantidad, Precio_Unitario, Subtotal) {
    this.ID_Detalle = ID_Detalle;
    this.ID_Venta = ID_Venta;
    this.ID_Producto = ID_Producto;
    this.Cantidad = Cantidad;
    this.Precio_Unitario = Precio_Unitario;
    this.Subtotal = Subtotal;
  }
}

module.exports = DetalleVenta;
