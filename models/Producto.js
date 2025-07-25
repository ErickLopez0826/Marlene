class Producto {
  constructor(ID_Producto, Nombre, Marca, Presentacion, Precio_Venta, Precio_Compra, Stock_Total, Activo, Fecha_Caducidad, ID_Proveedor) {
    this.ID_Producto = ID_Producto;
    this.Nombre = Nombre;
    this.Marca = Marca;
    this.Presentacion = Presentacion;
    this.Precio_Venta = Precio_Venta;
    this.Precio_Compra = Precio_Compra;
    this.Stock_Total = Stock_Total;
    this.Activo = Activo;
    this.Fecha_Caducidad = Fecha_Caducidad;
    this.ID_Proveedor = ID_Proveedor;
  }
}

module.exports = Producto;
