import winston from 'winston';
import { opciones } from '../config/config.js';

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: 'red',
    error: 'magenta',
    warning: 'yellow',
    info: 'cyan',
    http: 'blue',
    debug: 'white',
  },
};

let levelSegunEntorno;
export const setLoggerLevel = (level) => {
  if (logger[level] && typeof logger[level] === 'function') {
    logger.transports.forEach((transport) => {
      levelSegunEntorno= level;
      transport.level=level;
    });  
  }
};

const transports = [
  opciones.modo !== 'production' &&
    new winston.transports.Console({
      level: levelSegunEntorno,
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.simple()
      ),
    }),
  opciones.modo === 'production' &&
    new winston.transports.File({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.simple()
      ),
      filename: './errors.log',
    }),
].filter(Boolean); // Filtra los transportes nulos

export let logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports,
  });

export const loggerWithLevel = (level, message) => {
    if (logger[level] && typeof logger[level] === 'function') {
 
      logger[level](message);
    }
  };
