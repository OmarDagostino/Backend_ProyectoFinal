import mongoose from 'mongoose';
import {cartModel} from '../models/cart.model.js';
import {Router} from 'express';
import { ObjectId } from 'mongodb';
import {config} from '../config/config.js'

const router = Router ()

// sp Conectar a la base de datos MongoDB Atlas
// en MongoDB Atlas connection
await mongoose.connect(config.MONGO_URL);

// sp clases para manejo de datos de carritos
// en Cart classes for data management

export class cartsDataManager { 

  // sp Obtener un carrito por su ID
  // en Get cart by ID
  async obtenerCarrito (cid)
  {
    
    try {
      
      const cartId = cid;
      const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
      if (!validObjectId) { 
        console.error("Identificador del carrito invalido");
      } else {
        
        const cart = await cartModel.findOne({ _id : cartId }).populate('products.productId');
        
        if (cart) {
          return(cart);
        } else {
          console.error('Carrito no encontrado');
        }
      }
    } catch (error) {
      console.error('Error en el servidor', error);
    }
  };

  // sp Obtener un carrito por su ID pero sin la opción de populate
  // en Get cart by ID without populate option

  async obtenerCarritoSinPopulate (cid)
  {
    
    try {
      
      const cartId = cid;
      const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
      if (!validObjectId) { 
        console.error("Identificador del carrito invalido");
      } else {
        
        let cart = await cartModel.findOne({ _id : cartId });
        
        if (cart) {
          return(cart);
        } else {
          console.error('Carrito no encontrado');
        }
      }
    } catch (error) {
      console.error('Error en el servidor', error);
    }
  };

  // sp Actualizar un carrito
  // en Cart update
  
  async actualizarCarrito (newcart,cid) 
  {
    try {
      const cartId = cid;
      const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
      if (!validObjectId) { 
        console.error("Identificador del carrito invalido");
      } else {
        let cart = await cartModel.findOne({ _id : cartId }).exec();
        if (!cart) {
          console.error('Carrito no encontrado');
          return;
        }
        cart.products = newcart.products
        await cart.save();   
      }      
    } catch (error) {
      console.error (`Error en el servidor ${error}`)
    }
  };

  // sp Crear un nuevo carrito
  // en New cart 
  async crearCarrito  (newcart)
  {
    try {    
      await newcart.save();   
    } catch (error) {
      console.error(`Error en el servidor ${error}`);
    }
  }; 

}

export default cartsDataManager
