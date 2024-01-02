import multer from "multer";
import path from 'path';
import fs from 'fs';
import { now } from "mongoose";
import { usersServices } from '../services/usersServices.js';
import { ObjectId } from 'mongodb';

// Rutas de las carpetas
const uploadFolder = './uploads';
const documentsFolder = `${uploadFolder}/documents`;
const productsFolder = `${uploadFolder}/products`;
const profilesFolder = `${uploadFolder}/profiles`;

// Función para crear carpetas si no existen
function createFolders() {
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
  }
  if (!fs.existsSync(documentsFolder)) {
    fs.mkdirSync(documentsFolder);
  }
  if (!fs.existsSync(productsFolder)) {
    fs.mkdirSync(productsFolder);
  }
  if (!fs.existsSync(profilesFolder)) {
    fs.mkdirSync(profilesFolder);
  }
}

// Llama a la función para crear las carpetas
createFolders();

let nombreDelDocumento = ''
let tipoDelArchivo = ''
let indice = -1
let linkDelArchivo
let userId
let destinationPath

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
 
  const tipoArchivo = req.body.tipoArchivo1;
  
  if (Array.isArray(req.body.tipoArchivo1)) {
    indice = req.body.tipoArchivo1.length - 1
    nombreDelDocumento = req.body.tipoDocumento1[indice]
    if(req.body.otroTexto1[indice] !== '') {
        nombreDelDocumento = req.body.otroTexto1[indice]
    }
    tipoDelArchivo = req.body.tipoArchivo1[indice]

  } else {
    nombreDelDocumento = req.body.tipoDocumento1
    if(req.body.otroTexto1 !== '') {
        nombreDelDocumento = req.body.otroTexto1
      }
    tipoDelArchivo = req.body.tipoArchivo1
  }
 
    let folderx = '';

    if (tipoDelArchivo === 'documento') {
      folderx = 'documents';
    } else if (tipoDelArchivo === 'producto') {
      folderx = 'products';
    } else if (tipoDelArchivo === 'perfil') {
      folderx = 'profiles';
    }
    

    destinationPath = path.join(uploadFolder, folderx);
        
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    userId = req.params.uid 
    const now = new Date();
    const fechaComoString = now.toISOString().replace(/[^a-zA-Z0-9]/g, '');
    const nombreDelArchivoAGuardar = userId + '.' + fechaComoString + '.' + path.basename(file.originalname);
    linkDelArchivo= path.join(destinationPath, nombreDelArchivoAGuardar)
    cb(null,nombreDelArchivoAGuardar);
    let validObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
    if (validObjectId) 
    { 
     
    try {
      
      let usuario = usersServices.obtenerUsuarioPorId   (userId);
      
      if (usuario) {
         usersServices.actualizarDocumentosSubidos  (userId,nombreDelDocumento,linkDelArchivo)
      } else {
        console.error('el usuario informado no existe')
      }
    } catch (error) {
      console.error('error inesperado al tratar de actualizar los documentos subidos de un usuario por su ID: ' + error.message);
    }
    } else {
        
        if (userId!==undefined) {console.error ('el usuario informado no tiene un formato válido')
    }}
  },
});
const uploader = multer({ storage: storage });



export default { uploader };
