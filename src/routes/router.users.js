import {Router} from 'express';
import bodyParser from 'body-parser';
import usersController from '../controllers/usersController.js';
import { authUser, authAdmin } from '../middlewares/authMiddle.js';
export const router = Router ();
router.use(bodyParser.urlencoded({ extended: true }));
import upload from '../middlewares/uploadFiles.js';

// sp subir documentos con información de los usuarios
// en upload documents

router.post('/users/:uid/documents',upload.uploader.array('archivos1'),usersController.documents)
  
// sp actualizar tipo de usuario
// en Type of user update

router.get('/users/premium/:email',authUser, usersController.premium)

// sp mantenimiento de del tipo de usuario para el administrador
// en Type of user maintenance by administrator

router.put('/users/maintenanceTOU',authAdmin, usersController.usersMaintenanceTOU)

// sp eliminar un usuario
// en User delete

router.delete('/users/eliminarUsuario', authAdmin, usersController.usersDelete)

// sp depurar el archivo de usuarios eliminando los que no se conectaron en 2 días
// en user file debug, erasing those without activity in the last 2 days

router.delete('/users/depurarUsuarios', authAdmin, usersController.usersDebugging)