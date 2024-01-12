import {Router} from 'express';
import bodyParser from 'body-parser';
import usersController from '../controllers/usersController.js';
export const router = Router ();
router.use(bodyParser.urlencoded({ extended: true }));
import passport from 'passport'; 
import dtousuario from '../middlewares/dtoUsuario.js';

// sp Login con error
// en Error login
router.get ('/errorLogin', usersController.errorLogin);

// sp Login de Git Hub con error
// en Error login with Git HUb

router.get ('/errorLoginGitHub', usersController.errorLogin);

// sp registro con error
// en error in registration

router.get ('/errorRegistro', usersController.errorRegistro);

// sp Registro de un nuevo usuario 
// en new user registration

router.post('/registro', passport.authenticate('registro', {
    failureRedirect: '/api/sesions/errorRegistro',
    successRedirect: '/login', // Redirección exitosa
    session: false, // Desactiva la creación de sesiones
}))

// sp Login de un usuario o del administrador
// en User or administrator login 
router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sesions/errorLogin' }), usersController.Login)
  
// sp Login con GitHub
// en Git Hub login
router.get('/loginGitHub', passport.authenticate('loginGitHub', {}), (req, res, next) => { });  

router.get('/callbackGithub',  
    passport.authenticate('loginGitHub', 
        { 
            failureRedirect: '/api/sesions/errorLoginGitHub'          
        } 
    ),
    (req, res, next) => { 
        req.session.usuario = req.user;
        return res.redirect ('/products')
    }
);  

// sp logOut
// en logout

router.get('/logout', usersController.logout)

// sp mostrar los datos del usuario que esta registrado para mostrar con handlebars
// en return user data of current session to show in handlebars

router.get('/current1', usersController.current1)

// sp mostrar los datos del usuario que esta registrado
// en return user data of current session

router.get('/current',dtousuario, usersController.current)

// sp re-establecer contraseña
// en password restart
router.post('/forgot', usersController.forgot)

router.post('/recuperacion', usersController.recuperacion)
