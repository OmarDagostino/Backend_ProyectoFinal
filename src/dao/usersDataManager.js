import mongoose from 'mongoose';
import {cartModel} from '../models/cart.model.js';
import {userModel} from '../models/user.model.js';
import {Router} from 'express';
import {createHash} from '../util.js';
import {config} from '../config/config.js'

const router = Router ()

// sp Conectar a la base de datos MongoDB Atlas
// en MongoDB Atlas connection
mongoose.connect(config.MONGO_URL);

// sp Clases para el Manejo de usuarios
// en Users classes for data management
export class usersDataManager { 



async obtenerUsuarioPorEmail (direccionDeCorreo)
{
  try {
       
    const existingUser = await userModel.findOne({ email: direccionDeCorreo.username}).exec();
    return existingUser
   }
   catch (error) {
    console.error(`Error en el servidor ${error}`);
    }

};

async obtenerUsuarioPorId   (id)
{
  try {
     const existingUser = await userModel.findOne({ _id: id}).exec();
    return existingUser
   }
   catch (error) {
    console.error(`Error en el servidor ${error}`);
    }

};

async obtenerUsuarioPorCartid   (CartId)
{
  try {
   
    const existingUser = await userModel.findOne({ cartId: CartId}).exec();
    return existingUser
   }
   catch (error) {
    console.error(`Error en el servidor ${error}`);
    }

};

async crearUsuario  (name,email,password,typeofuser,last_name,age)
{
  let cartId
  try {
    const newCart = new cartModel({
      products: []
    });
    await newCart.save();
    cartId = newCart._id
  }
   catch (error) {
    consosle.error(error)
  }

  try {
    password=createHash(password);
    
    const user = new userModel({name,email,password,cartId,typeofuser,last_name, age});
    await user.save();
    return user;

   }
   catch (error) {
    console.error('*error en el servidor*');
    console.error(error);
    }
}

async actualizarUsuario  (email,usuario)
{  
    try {
    const existingUser = await userModel.findOne({ email: email}).exec();
    
    if (existingUser) {        
      existingUser.typeofuser= usuario.typeofuser
      existingUser.password=usuario.password
      await existingUser.save();
    
      return ;
    } else {
      console.error ('**** email no existe ****')
      return 
    }
   }
   catch (error) {
    console.error('*error en el servidor inesperado al tratar de actualizar el usuario*');
    console.error(error);
    }
}
async actualizarUsuarioUltimoLog  (email)
{  
    try {
    const existingUser = await userModel.findOne({ email: email}).exec();
    
    existingUser.last_connection = Date.now ()
    
    if (existingUser) {        
      
      await existingUser.save();
    
      return ;
    } else {
      console.error ('**** email no existe ****')
      return 
    }
   }
   catch (error) {
    console.error('*error en el servidor inesperado al tratar de actualizar el ultimo Log de usuario*');
    console.error(error);
    }
}

async actualizarDocumentosSubidos  (id,nombre,linkDelArchivo)
{
  
  try {
     const existingUser = await userModel.findOne({ _id: id}).exec();
     const elementoAAgregar = {name:nombre, reference:linkDelArchivo}
     existingUser.documents.push(elementoAAgregar)
     await existingUser.save();
    
   }
   catch (error) {
    console.error(`Error en el servidor ${error}`);
    }

};


}

export default usersDataManager
