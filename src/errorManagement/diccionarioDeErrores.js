import { loggerWithLevel } from "./logger.js";

export class ErrorDictionary {
    constructor() {
      this.errores = {
        1: { codigo: 451, descripcion: "El identificador del carrito no es válido", gravedad: "error", causa: "El formato no es válido para un identificador de MongoDB" },
        2: { codigo: 404, descripcion: "El carrito requerido no existe", gravedad: "error", causa: "Se ha tratado de acceder a un carrito pero este no existe en la base de datos" },
        3: { codigo: 500, descripcion: "Error inesperado al tratar de acceder a un carrito", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 3" },
        4: { codigo: 452, descripcion: "El identificador del producto no es válido", gravedad: "error", causa: "El formato no es válido para un identificador de MongoDB" },
        5: { codigo: 405, descripcion: "El producto requerido no existe", gravedad: "error", causa: "Se ha tratado de acceder a un producto pero este no existe en la base de datos" },
        6: { codigo: 201, descripcion: "Carrito actualizado correctamente", gravedad: "info", causa: "OK" },
        7: { codigo: 500, descripcion: "Error inesperado al tratar de actualizar un carrito", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 7" },
        8: { codigo: 200, descripcion: "Carrito creado correctamente", gravedad: "info", causa: "OK" },
        9: { codigo: 500, descripcion: "Error inesperado al tratar de crear un carrito", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 9" },
        10: { codigo: 500, descripcion: "Error inesperado en el proceso de compra ", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 10" },
        11: { codigo: 406, descripcion: "El producto no existe en el carrito informado", gravedad: "error", causa: "El producto no existe en el carrito informado" },
        12: { codigo: 500, descripcion: "Error inesperado al tratar de eliminar un producto de un carrito ", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 12" },
        13: { codigo: 500, descripcion: "Error inesperado al tratar de eliminar todos los productos de un carrito ", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 13" },
        14: { codigo: 453, descripcion: "Datos faltantes o inválidos", gravedad: "error", causa: "Hay datos faltantes o su formato es inválido" },
        15: { codigo: 500, descripcion: "Error inesperado al tratar obtener un producto por su ID", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 15" },
        16: { codigo: 500, descripcion: "Error inesperado al tratar de recuperar los productos solicitados", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 16" },
        17: { codigo: 500, descripcion: "Error inesperado al tratar de eliminar un producto", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 17" },
        18: { codigo: 400, descripcion: "Código de producto ya existe", gravedad: "error", causa: "Se esta tratando de dar de alta un producto pero el código ya existe" },
        19: { codigo: 200, descripcion: "Producto creado correctamente", gravedad: "info", causa: "OK" },
        20: { codigo: 500, descripcion: "Error inesperado al tratar de crear un producto ", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 20" },
        21: { codigo: 201, descripcion: "Producto actualizado correctamente", gravedad: "info", causa: "OK" },
        22: { codigo: 500, descripcion: "Error inesperado al tratar de actualizar un producto ", gravedad: "fatal", causa: "Comuniquese con el administrador e informe error inesperado 22" },
        23: { codigo: 201, descripcion: "Producto eliminado correctamente", gravedad: "info", causa: "OK" },
        24: { codigo: 403, descripcion: "Usuario no autorizado a hacer esta transacción", gravedad: "error", causa: "Usuario esta tratando de actualizar un producto que no esta registrado con su email"},
        25: { codigo: 403, descripcion: "No se puede comprar un producto del mismo usuario que lo creo", gravedad:"error", causa:"se esta tratando de comprar un producto que comercializa el usuario que lo quiere comprar"},
        26: { codigo: 407, descripcion: "El producto que se desea comprar no tiene stock", gravedad:"error", causa:"se esta tratando de comprar un producto que no tiene existenciasr"},
        991: { codigo: 201, descripcion: "Error de prueba para logger gravedad fatal", gravedad: "fatal", causa: "OK" },
        992: { codigo: 201, descripcion: "Error de prueba para logger gravedad error", gravedad: "error", causa: "OK" },
        993: { codigo: 201, descripcion: "Error de prueba para logger gravedad warning", gravedad: "warning", causa: "OK" },
        994: { codigo: 201, descripcion: "Error de prueba para logger gravedad info", gravedad: "info", causa: "OK" },
        995: { codigo: 201, descripcion: "Error de prueba para logger gravedad http", gravedad: "http", causa: "OK" },
        996: { codigo: 201, descripcion: "Error de prueba para logger gravedad debug", gravedad: "debug", causa: "OK" }
        
      };
    }
  
    getErrorMessage(code) {
      return this.errores[code] || "Error desconocido";
    }
  }
  
  
  export class CustomError {
    static createCustomError(codigoDeError) {
      const errorDictionary = new ErrorDictionary();
      const errorInfo = errorDictionary.getErrorMessage(codigoDeError);  
      const error = new Error(errorInfo.codigo);
      error.codigo = errorInfo.codigo;
      error.descripcion = errorInfo.descripcion;
      error.causa = errorInfo.causa;
      error.gravedad = errorInfo.gravedad; 
      loggerWithLevel (error.gravedad, error.descripcion)
      return error;
    }
  }