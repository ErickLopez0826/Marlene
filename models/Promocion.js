class Promocion {
  constructor(ID_Promocion, Descripcion, Fecha_Inicio, Fecha_Fin, Activo, Tipo, Descuento_Porcentual, Precio_Promocional) {
    this.ID_Promocion = ID_Promocion;
    this.Descripcion = Descripcion;
    this.Fecha_Inicio = Fecha_Inicio;
    this.Fecha_Fin = Fecha_Fin;
    this.Activo = Activo;
    this.Tipo = Tipo;
    this.Descuento_Porcentual = Descuento_Porcentual;
    this.Precio_Promocional = Precio_Promocional;
  }
}

module.exports = Promocion;
