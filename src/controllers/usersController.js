import {Router} from 'express'
import express from 'express'
import {createHash} from '../util.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import {isValidPassword} from '../util.js';
import {config} from '../config/config.js'
import { usersServices } from '../services/usersServices.js';
import crypto from 'crypto';
export const router = Router ()

// sp Configurar el transporte del mail
// en Email transport set up
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
  res.status(400).render('login',{errorDetail : 'login con error', error: true, mostrarMenu1:true, mostrarMenu3:true})
};

// sp Login de Git Hub con error
// en GitHub login with error

async function errorLoginGitHub (req,res) {
  res.status(400).render('loginGitHub',{errorDetail : 'login con error', error: true,mostrarMenu2:true,mostrarMenu3:true})    
};

// sp registro con error
async function errorRegistro (req,res) {
  res.status(400).render('registro',{errorDetail : 'Registro con error', error: true,mostrarMenu2:true,mostrarMenu3:true})    
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
  } catch (error) {
    return res.status(500).send(`error inesperado al actualizar el ultimo login del usuario`)
  }
  if (req.session.admin) {
    // sp Redirige al menu del administrador 
    // en Redirects to Administrator menu 
    return res.redirect('/admin'); 
  } else {
    // sp Redirige al usuario
    // en Redirects to User 
    return res.redirect('/products'); 
  }
};

// sp hacer el logOut
// en Logout process
async function logout(req,res) {
  if (req.session.usuario) {
    try {
      let email = req.session.usuario.email
      await usersServices.actualizarUsuarioUltimoLog(email)
    } catch (error) {
      return res.status(500).send(` error inesperado al actualizar el ultimo logout del usuario ${error}`)
    }
    await req.session.destroy()
  }
  res.redirect('/login?mensaje=logout correcto... !')
}

// sp mostrar los datos del usuario que esta registrado
// en return users data 

async function current (req,res) {
  const usuario= req.dto.usuario 
  return res.status(200).json({usuario})
}

// sp mostrar los datos del usuario que esta registrado con handlebars
// en return users'data with handlebars

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
      // sp Verificar si al menos hay un elemento con name: 'identificacion'
      // en Verify at least one element with the name "identificacion" is present
      let existeIdentificacion = usuario.documents.some(elemento => elemento.name === 'identificacion');
      // sp Verificar si al menos hay un elemento con name: 'estado de cuenta'
      // en Verify at least one element with the name "estado de cuenta" is present
      let existeEstadoCuenta = usuario.documents.some(elemento => elemento.name === 'estadoCuenta');
      // sp Verificar si al menos hay un elemento con name: 'domicilio'
      // en Verify at least one element with the name "domicilio" is present
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
    } else {
      return res.status(404).send(`el email informado ${email} no esta registrado`)
    }
  } catch (error){
    return res.status(500).send(`error inesperado al cambiar el tipo de usuario`)
  }
}

// sp solicitar recuperar la contraseña 
// en request new password

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

// sp restablecer la contraseña
// en restore password 

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
  } catch (error) {
    return res.status(500).send('error inesperado al tratar de actualizar la contraseña')
  }
}

// sp subir archivo con documentación e imagenes de los usuarios
// en upload users documentation and images

async function documents (req,res) {  
  return res.status(200).send('archivos subidos'); 
}


// sp mantenimiento de usuarios (Tipo de usuarios)
// en users maintenance (Type of user)

async function usersMaintenanceTOU (req,res) {
  try {
    const id = req.body.id
    await usersServices.actualizarType(id)
    return res.status(200).json({message: 'tipo de usuario modificado' });
  } catch (error) {
    console.error('Error inesperado al modificar el tipo de usuario:', error);
    return res.status(500).send('error inesperado al tratar de actualizar el tipo de usuario')
  } 
}

// sp Eliminar un usuario)
// en Users delete

async function usersDelete(req,res) {
  try {
    const id = req.body.id;
    await usersServices.eliminarUsuario(id);
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {   
    console.error('Error inesperado al eliminar usuario:', error);
    res.status(500).json({ error: 'Error inesperado al tratar de eliminar un usuario' });
  }
}

// sp Depurar el archivo de usuarios eliminando aquellos que no se conectaron en los ultimos 2 días
// en Users' file debugging erasing those inactive in the last two days

async function usersDebugging (req,res) {
  try {
    let currentDate = new Date();
    let tiempoLimiteEnMilisegundos = 2 * 24 * 60 * 60 * 1000 // 2 dias
    const allusers = await usersServices.obtenerUsuarios();
    allusers.forEach(async (usuario,indice)=>{
      if (usuario.typeofuser!=='admin') {
        let diferenciaEnMilisegundos = currentDate - usuario.last_connection;
        if (diferenciaEnMilisegundos > tiempoLimiteEnMilisegundos) {
          const userId = usuario._id    
          const useremail = usuario.email;
          const sendermail = config.GMAIL_USER;
          const subject = 'Inactividad de su cuenta en el comercio electrónico';
          const text = `Estimado Cliente : Como no ha registrado actividad en los ultimos 2 días su cuenta en el Comercio Electrónico ha sido dada de baja, para reingresar debera registrarse nuvamente. Saludos Cordiales`;
          await transport.sendMail({
            from: sendermail,
            to: useremail,
            subject: subject,
            text: text
          });
          await usersServices.eliminarUsuario (userId) 
        }
      }
    });
    res.status(200).json({ message: 'Usuarios depurados exitosamente' });
  } catch (error) {  
    console.error('Error inesperado al depurar el archivo de usuarios:', error);
    res.status(500).json({ error: 'Error inesperado al tratar de depurar el archivo de usuarios' });
  }
}

// sp función para validar el formato de un correo electrónico
// en email format check function 

function validarCorreoElectronico(correo) {
  const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return expresionRegular.test(correo);
}
  
export default {errorLogin, errorLoginGitHub, premium, usersMaintenanceTOU, usersDelete, usersDebugging, errorRegistro, Login ,logout, current, current1, forgot, recuperacion, documents}