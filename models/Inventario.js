class Inventario {
  constructor(ID_Inventario, ID_Producto, Tipo_Movimiento, Cantidad, Fecha_Movimiento, Observaciones, ID_Usuario) {
    this.ID_Inventario = ID_Inventario;
    this.ID_Producto = ID_Producto;
    this.Tipo_Movimiento = Tipo_Movimiento;
    this.Cantidad = Cantidad;
    this.Fecha_Movimiento = Fecha_Movimiento;
    this.Observaciones = Observaciones;
    this.ID_Usuario = ID_Usuario;
  }
}

module.exports = Inventario;
