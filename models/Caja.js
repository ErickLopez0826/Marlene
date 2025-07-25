class Caja {
  constructor(ID_Caja, Fecha_Corte, Total_Efectivo, Total_Transferencia, Total_Caja, Responsable, Observaciones, ID_Usuario) {
    this.ID_Caja = ID_Caja;
    this.Fecha_Corte = Fecha_Corte;
    this.Total_Efectivo = Total_Efectivo;
    this.Total_Transferencia = Total_Transferencia;
    this.Total_Caja = Total_Caja;
    this.Responsable = Responsable;
    this.Observaciones = Observaciones;
    this.ID_Usuario = ID_Usuario;
  }
}

module.exports = Caja;
