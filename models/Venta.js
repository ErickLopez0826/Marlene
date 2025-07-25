class Venta {
  constructor(ID_Venta, Fecha_Venta, Monto_Total, Forma_Pago, ID_Caja, ID_Usuario) {
    this.ID_Venta = ID_Venta;
    this.Fecha_Venta = Fecha_Venta;
    this.Monto_Total = Monto_Total;
    this.Forma_Pago = Forma_Pago;
    this.ID_Caja = ID_Caja;
    this.ID_Usuario = ID_Usuario;
  }
}

module.exports = Venta;
