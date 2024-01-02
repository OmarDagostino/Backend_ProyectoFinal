import { CustomError } from '../errorManagement/diccionarioDeErrores.js';

const loggerTest = (req, res) => {
   
    CustomError.createCustomError(991)
    CustomError.createCustomError(992)
    CustomError.createCustomError(993)
    CustomError.createCustomError(994)
    CustomError.createCustomError(995)
    CustomError.createCustomError(996)
  
  res.send('Logs probados. Verifica la consola del servidor si estas en modo de desarrollo o el archivo errors.log si estas en modo de producción.');

};

export default { loggerTest };
