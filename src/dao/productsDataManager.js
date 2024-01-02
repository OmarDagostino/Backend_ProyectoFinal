import mongoose from 'mongoose';
import {productModel} from '../models/product.model.js';
import {Router} from 'express';
import { ObjectId } from 'mongodb';
import {config} from '../config/config.js'

const router = Router ()

// sp Conectar a la base de datos MongoDB Atlas
// en MongoDB Atlas connection
mongoose.connect(config.MONGO_URL);


// sp clases para el manejo de productos
// en Product classes for data management

export class productsDataManager { 
 


// sp obtener una lista de productos con filtros y paginaciones
// en get all products or several considering filters and pagination

async obtenerProductos (combinedFilter, options)
{
  try {
    const products = await productModel.paginate(combinedFilter, options);

    return (products);
  } catch (error) {
    console.error({ status: 'error', message: 'Error en el servidor',error });
  }
};

// sp obtener un producto por su ID
// en get a product by ID
async obtenerProducto (pid) 
{
  try {
    const productId = pid ;
    const validObjectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;
    if (!validObjectId) { 
      console.error("* Identificador de Producto invalido *");
      } else {
        const product = await productModel.findOne({ _id: productId}).exec();
        if (product) {
          return (product);
        } else {
          console.error('Producto no encontrado');
        }
      }
  } catch (error) {
    console.error(`Error en el servidor ${error}`);
  }
};

// sp obtener un producto por su codigo
// en get a product by code

async obtenerProductoPorCodigo (codigo) 
{
  try {
  const existingProduct = await productModel.findOne({ code: codigo }).exec();
  return existingProduct
 }
 catch (error) {
  console.error(`Error en el servidor ${error}`);
  }
};

// sp Crear un nuevo producto
// en New product creation
async crearProducto (newProduct) 
{
    try {
      
      const product = new productModel({ ...newProduct});
      if (product.status===undefined || product.status !== true && product.status !== false ) {
        product.status = true
      }
      await product.save();
  
      
    } catch (error) {
      console.error('Error en el servidor',error);
    }
  };
  

// sp Actualizar un productos
// en Product update
async actualizarProducto (producto,pid) 
{
  try {
    const productId = pid;
    const updatedProduct = producto;
    const validObjectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;
    if (!validObjectId) { 
      console.error("** Identificador de Producto invalido **");
      } else {


    let product = await productModel.findOne({ _id : productId }).exec();

    if (!product) {
      console.error('Producto no encontrado');
      return;
    }


    product = updatedProduct
    await product.save();
    
  }
  } catch (error) {
    console.error('******Error en el servidor*******');
  }
};

// sp Eliminar un producto por su ID
// en Product delete by ID
async eliminarProducto (pid) 
{
  try {
    const productId = pid;
    const validObjectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;
    if (!validObjectId) { 
      console.error("Identificador de Producto invalido");
      } else {

    const product = await productModel.findOne({ _id : productId }).exec();

    if (!product) {
      console.error('Producto no encontrado');
      return;
    }

    await product.deleteOne({ _id : productId })
    console.error(`Producto con ID ${productId} eliminado`)
  }
  } catch (error) {
    console.error(error)
    console.error('Error en el servidor')
  }
}
}

export default productsDataManager
