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

if (opciones.modo !== 'production') {
  levelSegunEntorno = 'debug';
} else {
  levelSegunEntorno = 'info';
}

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

export const logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports,
});

export const loggerWithLevel = (level, message) => {
  if (logger[level] && typeof logger[level] === 'function') {
    logger[level](message);
  }
};

logger.setMaxListeners(20);
