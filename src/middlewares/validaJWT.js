import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { Router } from 'express';
import { parse as parseQueryString } from 'querystring';

const router = Router();

export function validaJWT(req, res, next) {
  try {
    const tokenQuery = parseQueryString(req.url.split('?')[1], true);  
    const token = tokenQuery.token;

    if (!token) {
    
      return res.render('../views/forgot',{mostrarMensaje:true, mensaje:'no se han proporcinado las credenciales'});
    
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    req.decoded = decoded;

    next();
  } catch (error) {
  
    return res.render('../views/forgot',{mostrarMensaje:true, mensaje:'Permiso caducado o corrupto'});
  }

}
