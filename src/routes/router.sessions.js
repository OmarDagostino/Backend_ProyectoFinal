import {Router} from 'express';
import bodyParser from 'body-parser';
import usersController from '../controllers/usersController.js';
import { authUser } from '../middlewares/authMiddle.js';
export const router = Router ();
router.use(bodyParser.urlencoded({ extended: true }));
import passport from 'passport'; 
import dtousuario from '../middlewares/dtoUsuario.js';
import upload from '../middlewares/uploadFiles.js';


router.get ('/errorLogin', usersController.errorLogin);

// Login de Git Hub con error

router.get ('/errorLoginGitHub', usersController.errorLogin);

// registro con error

router.get ('/errorRegistro', usersController.errorRegistro);

// Registro de un nuevo usuario 

router.post('/registro', passport.authenticate('registro', {
    failureRedirect: '/api/sesions/errorRegistro',
    successRedirect: '/login', // Redirección exitosa
    session: false, // Desactiva la creación de sesiones
}))

// Login de un usuario o del administrador
router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sesions/errorLogin' }), usersController.Login)
  
// Login con GitHub
router.get('/loginGitHub', passport.authenticate('loginGitHub', {}), (req, res, next) => { });  

router.get('/callbackGithub',  passport.authenticate('loginGitHub', 
        { 
            failureRedirect: '/api/sesions/errorLoginGitHub'
            
        } 
    ),(req, res, next) => { 
   
    req.session.usuario = req.user;
    return res.redirect ('/products')
    });  

// logOut

router.get('/logout', usersController.logout)

// mostrar los datos del usuario que esta registrado

router.get('/current1', usersController.current1)

// mostrar los datos del usuario que esta registrado

router.get('/current',dtousuario, usersController.current)

// actualizar tipo de usuario

router.get('/premium/:email',authUser, usersController.premium)

// re-establecer contraseña

router.post('/forgot', usersController.forgot)

router.post('/recuperacion', usersController.recuperacion)

// subir documentos con información de los usuarios

router.post('/users/:uid/documents',upload.uploader.array('archivos1'),usersController.documents)
  