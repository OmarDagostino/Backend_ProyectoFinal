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
export class usersDataManager 
{ 
  // sp Obtener un usuario con el email
  // en Get user by email
  async obtenerUsuarioPorEmail (direccionDeCorreo)
  {
    try {       
      const existingUser = await userModel.findOne({ email: direccionDeCorreo.username}).exec();
      return existingUser
    } catch (error) {
      console.error(`Error en el servidor ${error}`);
    }

  };
  // sp Obtener un usuario con ID
  // en Get user by ID
  async obtenerUsuarioPorId (id)
  {
    try {
      const existingUser = await userModel.findOne({ _id: id}).exec();
      return existingUser
    } catch (error) {
      console.error(`Error en el servidor ${error}`);
    }
  };
  // sp Obtener un usuario con el ID del carrito
  // en Get user by ID Cart
  async obtenerUsuarioPorCartid   (CartId)
  {
    try { 
      const existingUser = await userModel.findOne({ cartId: CartId}).exec();
      return existingUser
    } catch (error) {
      console.error(`Error en el servidor ${error}`);
    }
  };
  // sp Obtener todos los usuarios
  // en Get all users 
  async obtenerUsuarios () {
    try {
      
      const allUsers = await userModel.find({}).exec();
      
      return allUsers
    }
    catch (error) {
      console.error(`Error en el servidor ${error}`);
      }
  }
  // sp Crear un usuario
  // en User creation
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
  // sp Actualizar un usuario
  // en User update
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
  // sp Actualizar el tipo de usuario 
  // en Type of user update
  async actualizarType (id)
  {  
    try {
      const existingUser = await userModel.findOne({ _id : id}).exec();  
      if (existingUser) {          
        if (existingUser.typeofuser==='premium') {  
          existingUser.typeofuser= 'user'
        } else {
          if (existingUser.typeofuser==='user') {  
            existingUser.typeofuser= 'premium'
          }
        }     
        await existingUser.save();
        return ;
      } else {
        console.error (`**** usuario ${id} no existe ****`)
        return 
      }
    } catch (error) {
      console.error('*error en el servidor inesperado al tratar de actualizar el tipo de usuario*');
      console.error(error);
      }
  }
  // sp Eliminar un usuario
  // en User delete
  async eliminarUsuario (id)
  {  
    try {
      const existingUser = await userModel.findOne({ _id : id}).exec();
      if (existingUser) {      
        let cartid = existingUser.cartId    
        const existingCart = await cartModel.findOne({_id : cartid}).exec();
          if (existingCart) {
            await existingCart.deleteOne({_id : cartid}); 
          } else {
            console.error (`**** carrito del usuario ${id} cuya _id es ${cartid} no existe ****`)
            return;
          }
        await existingUser.deleteOne({_id : id});
        return ;
      } else {
        console.error (`**** usuario ${id} no existe ****`)
        return 
      }
    }
    catch (error) {
      console.error('*error en el servidor inesperado al tratar de eliminar un usuario*');
      console.error(error);
    }
  }
  // sp actualizar la fecha y hora de la última conección
  // en date stamp unpdate with the last connection
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
    } catch (error) {
      console.error('*error en el servidor inesperado al tratar de actualizar el ultimo Log de usuario*');
      console.error(error);
    }
  }
  // sp Actualizar el array de documentos subidos por un usuario
  // en Array documents uploaded update in the users file
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
