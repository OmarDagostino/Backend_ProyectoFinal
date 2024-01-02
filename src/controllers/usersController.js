import {Router} from 'express'
import express from 'express'
import {createHash} from '../util.js';
import { ObjectId } from 'mongodb';
import bodyParser from 'body-parser'
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import {isValidPassword} from '../util.js';
import {config} from '../config/config.js'
import { usersServices } from '../services/usersServices.js';
import crypto from 'crypto';
export const router = Router ()

const transport = nodemailer.createTransport({
  service:'gmail',
  port:config.PORT,
  auth:{
    user:config.GMAIL_USER,
    pass:config.GMAIL_PASS
  }
})

router.use(express.urlencoded({ extended: true }));

// sp Login con email con error
// en Email login with error

async function errorLogin (req,res)  {
    res.redirect('/login?error=Login con error')    
    };

// sp Login de Git Hub con error
// en GitHub login with error

async function errorLoginGitHub (req,res) {
    res.redirect('/loginGitHub?error=**Login con error**')    
    };

// sp registro con error
// en registration with error

async function errorRegistro (req,res) {
    res.redirect('/registro?error=Error de registro')    
    };

// sp Login de un usuario o del administrador con email y password
// en user or administrator login with email and password
async function Login (req, res, next) {
    
    req.session.usuario = req.user;
    
    req.session.admin = false;

    if (req.user && req.user.email === config.EMAIL_ADMINISTRADOR) {
      // sp Establece una propiedad 'admin' en la sesión para identificar al administrador
      // en Set 'amdin' property boolean in order to identify administrator
      req.session.admin = true;
    }
    try {
      let email = req.session.usuario.email
      await usersServices.actualizarUsuarioUltimoLog(email)
    }
  
    catch (error) {
      return res.status(500).send(`error inesperado al actualizar el ultimo login del usuario`)
    }

    if (req.session.admin) {
      // sp Redirige al menu del administrador 
      // en Administrator menu redirects
      return res.redirect('/admin'); 
    } else {
      // sp Redirige al usuario
      // en User redirects
      return res.redirect('/products'); 
    }
  };


// sp hacer el logOut
// en Logout process

async function logout(req,res) {
  try {
        let email = req.session.usuario.email
        await usersServices.actualizarUsuarioUltimoLog(email)
    }
    
  catch (error){
    return res.status(500).send(`error inesperado al actualizar el ultimo logout del usuario`)
  }
   
    await req.session.destroy(e=> console.error(e)),
    res.redirect('/login?mensaje=logout correcto... !')

}

// sp mostrar los datos del usuario que esta registrado
// en return users'data 

async function current (req,res) {
  const usuario= req.dto.usuario 
  return res.status(200).json({usuario})

}

// sp mostrar los datos del usuario que esta registrado con handlebars
// en return users'data in order to show it through hadlebars

async function current1 (req,res) {
  
  return res.redirect('./current')
}

// sp actualizar el tipo de usuario (premium o user)
// en update type of user (premium or user)
 async function premium (req,res) {
try {
  const email = req.params.email
  const direccionDeCorreo={username:email}
  const usuario = await usersServices.obtenerUsuarioPorEmail(direccionDeCorreo)
  if (usuario) { 
    // Verificar si al menos hay un elemento con name: 'identificacion'
let existeIdentificacion = usuario.documents.some(elemento => elemento.name === 'identificacion');

// Verificar si al menos hay un elemento con name: 'estadoCuenta'
let existeEstadoCuenta = usuario.documents.some(elemento => elemento.name === 'estadoCuenta');

// Verificar si al menos hay un elemento con name: 'domicilio'
let existeDomicilio = usuario.documents.some(elemento => elemento.name === 'domicilio');

if (usuario.typeofuser==='user') {
  if (!existeIdentificacion || !existeEstadoCuenta || !existeDomicilio) {
    return res.status(403).send('Falta subir alguna documentación para ser premium')
  }
}

      if (usuario.typeofuser==='user') {
        usuario.typeofuser="premium"
      }else {
        usuario.typeofuser="user"
      }
      req.session.usuario.typeofuser=usuario.typeofuser
      await usersServices.actualizarUsuario(email,usuario)
      return res.status(201).send('usuario actualizado')
  }
  else {
    return res.status(404).send(`el email informado ${email} no esta registrado`)
  }
}
catch (error){
  return res.status(500).send(`error inesperado al cambiar el tipo de usuario`)
}
 }

// sp solicitar recuperar la contraseña 
// en require a new password

 async function forgot(req, res, next) {
  
  try {
    let email = req.body.email;
    if (!validarCorreoElectronico(email)) {
      return res.status(404).send('el mail informado no tiene un formato válido')
    }
    const direccionDeMail = {}
    direccionDeMail.username = email
    const usuario = await usersServices.obtenerUsuarioPorEmail(direccionDeMail);
    if (!usuario) {
      return res.status(404).send(`El email informado ${email} no está registrado`);
    }
    
    const token = jwt.sign({ email }, config.JWT_SECRET, { expiresIn: '1h' });  // 1 hora de caducidad
    const useremail = email;
    const sendermail = config.GMAIL_USER;
    const subject = 'Restablecimiento de Contraseña';
    const text = `Para restablecer tu contraseña, haz clic en el siguiente enlace: ${config.URLRecuperacionPassword}?token=${token}`;
    await transport.sendMail({
      from: sendermail,
      to: useremail,
      subject: subject,
      text: text
    });
    return res.status(200).send('te fue enviado un mail a tu casilla con un link para reestablecer la contraseñá, expirará en 60 minutos')

  } catch (error) {
    return res.status(500).send(`Error inesperado al tratar de restablecer la contraseña`);
  }
}

// sp efectuar la recuperación de la contraseña
// en password re-start process

async function recuperacion (req,res,next) {
  let { email, newPassword } = req.body;
   let usuario
  try {
    if (!validarCorreoElectronico(email)) {
      return res.status(404).send('el mail informado no tiene un formato válido')
    }
    const direccionDeMail = {}
    direccionDeMail.username = email
    usuario = await usersServices.obtenerUsuarioPorEmail(direccionDeMail);
    if (!usuario) {
      return res.status(404).send(`El email informado ${email} no está registrado`);
    }
  } catch (error) {
      return res.status(500).send('error inesperado al tratar de reestablecer la contraseña')
  }

  newPassword=crypto.createHmac('sha256','palabraSecreta').update(newPassword).digest('base64')

  if (isValidPassword(newPassword,usuario.password)) {
    return res.status(403).send('la contraseña no puede ser igual a la anteriormente registrada')
  }
  newPassword=createHash(newPassword);
  usuario.password=newPassword
 

  try {
    await usersServices.actualizarUsuario(email,usuario)
    return res.render('../views/login',{mostrarMensaje:true,error:false, mensaje:'contraseña actualizada, debes hacer login'});
    // return res.status(201).send('contraseña actualizada')
  } catch (error) {
    return res.status(500).send('error inesperado al tratar de actualizar la contraseña')
  }
}

// sp subir archivo con documentación e imagenes de los usuarios
// en upload users douidcumentation and images

async function documents (req,res) {
  
  return res.status(200).send('archivos subidos');
  
}


// sp función para validar el formato de un correo electrónico
// en email format check function 

function validarCorreoElectronico(correo) {
  const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return expresionRegular.test(correo);
}
  
  export default {errorLogin, errorLoginGitHub, premium, errorRegistro, Login ,logout, current, current1, forgot, recuperacion, documents}