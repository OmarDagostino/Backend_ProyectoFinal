import {Router} from 'express';
import bodyParser from 'body-parser';
import usersController from '../controllers/usersController.js';
import { authUser, authAdmin } from '../middlewares/authMiddle.js';
export const router = Router ();
router.use(bodyParser.urlencoded({ extended: true }));
import upload from '../middlewares/uploadFiles.js';

// subir documentos con información de los usuarios

router.post('/users/:uid/documents',upload.uploader.array('archivos1'),usersController.documents)
  
// actualizar tipo de usuario

router.get('/users/premium/:email',authUser, usersController.premium)

// mantenimiento de del tipo de usuario

router.put('/users/maintenanceTOU',authAdmin, usersController.usersMaintenanceTOU)

// eliminar un usuario

router.delete('/users/eliminarUsuario', authAdmin, usersController.usersDelete)

// depurar el archivo de usuarios eliminando los que no se conectaron en 2 días

router.delete('/users/depurarUsuarios', authAdmin, usersController.usersDebugging)