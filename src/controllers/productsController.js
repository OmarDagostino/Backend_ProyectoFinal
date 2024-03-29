import { ObjectId } from 'mongodb';
import { productServices } from '../services/productsServices.js';
import {Router} from 'express';
const router = Router ()

import nodemailer from 'nodemailer';
import {config} from '../config/config.js'
import bodyParser from 'body-parser';
router.use(bodyParser.urlencoded({ extended: true }));

import { body, validationResult } from 'express-validator';
import { generateProducts }  from '../util.js';
import { CustomError } from '../errorManagement/diccionarioDeErrores.js';

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

// sp: GET para retornar varios productos o todos
// en: GET return several or all products 
async function getProducts (req, res) {
  let customStatusCode =500 ;   
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sortOrder = req.query.sort; 
    const query = req.query.query || ''; 
    const filter = {}; 
    if (req.session.usuario.typeofuser!=='admin') {
      filter.owner = req.session.usuario.email
    } 
    if (req.query.category) {
      filter.category = req.query.category; 
    }
    if (req.query.stock) {
      filter.stock = req.query.stock; 
    }    
    const options = {
      page,
      limit,
      sort: sortOrder ? { price: sortOrder === 'desc' ? -1 : 1 } : null,
    };
    const combinedFilter = {
      ...filter
    };
    const products = await productServices.obtenerProductos(combinedFilter, options);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < products.totalPages ? page + 1 : null;
    const response = {
      status: 'success',
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: prevPage ? `/products?page=${prevPage}&limit=${limit}&sort=${sortOrder}&query=${query}` : null,
      nextLink: nextPage ? `/products?page=${nextPage}&limit=${limit}&sort=${sortOrder}&query=${query}` : null,
    };
    res.status(200).json(response);
  } catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(16);
          customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
};


// sp: GET para retornar un producto por su ID
// en: GET to return specific product by ID
async function getProductById (req, res) {
 let customStatusCode = 500;
  try {
    const productId = req.params.pid;
    const validObjectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;    
    if (!validObjectId) { 
      let error = CustomError.createCustomError(4);
      customStatusCode=error.codigo;
      throw (error);
    } else {
      const product = await productServices.obtenerProducto(productId);
      if (product) {
        res.status(200).json(product);
      } else {
        let error = CustomError.createCustomError(5);
        customStatusCode=error.codigo;
        throw (error);
      }
    }
  } catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(15);
          customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
};

// sp GET para retornar 100 productos imaginarios creados con faker-js
// en GET to return 100 fake products created by faker-js
async function getMockingProducts (req,res) {
  let products = [];
  for (let i=0;i<100;i++) {
    products[i] = generateProducts ()
  }
  res.status(200).json(products);
}

// sp POST para crear un nuevo producto
// en post to create new product
async function crearProducto(req, res) {
  let customStatusCode =500;   
  try {   
    let newProduct = req.body;
    if(req.session.usuario.typeofuser=='admin') {
      newProduct.owner = req.session.usuario.typeofuser
    } else { 
      newProduct.owner = req.session.usuario.email
    }; 
    const existingProduct = await productServices.obtenerProductoPorCodigo(newProduct.code);
    if (existingProduct) {    
      let error = CustomError.createCustomError(18);
      customStatusCode=error.codigo;
      throw (error);
    }   
    await productServices.crearProducto(newProduct);
    let error = CustomError.createCustomError(19);     
    customStatusCode=error.codigo;
    throw (error);
  } catch (error) { 
    if (customStatusCode===500) {  
      let error = CustomError.createCustomError(20);
      customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
}

// sp PUT para actualizar un producto por su ID
// en PUT to update new product by ID
async function actualizarProducto (req, res) {
  let customStatusCode =500            ;   
  try {
    const productId = req.params.pid;
    const updatedProduct = req.body;
    // sp validar formato de las propiedades
    // en properties'format check
    const validateUpdateProduct = [
      body('title').optional().isString(),
      body('description').optional().isString(),
      body('code').optional().isString(),
      body('price').optional().isNumeric(),
      body('stock').optional().isNumeric(),
      body('category').optional().isString(),
      body('status').optional().isBoolean(),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          let error = CustomError.createCustomError(14);
          customStatusCode=error.codigo;
          throw (error,errors.array());
        }
        next();
      }
    ];
    const validObjectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;
    if (!validObjectId) { 
      let error = CustomError.createCustomError(4);
      customStatusCode=error.codigo;
      throw (error);
    } else {
      const product = await productServices.obtenerProducto(productId);
      if (!product) {
        let error = CustomError.createCustomError(5);
        customStatusCode=error.codigo;
        throw (error);
      }
      // sp Validar que el owner sea compatible con el tipo de usuario y su email
      // en owner check : type of user and email
      if (req.session.usuario.typeofuser!=='admin' && product.owner !== req.session.usuario.email) {
        let error = CustomError.createCustomError(24);
        customStatusCode=error.codigo;
        throw (error);
      }

      // sp Actualizar el producto
      // en Product update
      for (const key in updatedProduct) {
        if (updatedProduct.hasOwnProperty(key)) {
          product[key] = updatedProduct[key];
        }
      }
      await productServices.actualizarProducto(product,productId);
      let error = CustomError.createCustomError(21);
      customStatusCode=error.codigo;
      throw (error);
    }
  } catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(22);
      customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
};

// sp DELETE para eliminar un producto por su ID
// en delete Product by Id
async function borrarProducto(req, res) {
  let customStatusCode =500 ;
  let updatedProducts=[]   ;   
  try {
    
    const productId = req.params.pid;
    const validObjectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;
    if (!validObjectId) { 
      let error = CustomError.createCustomError(4);
      customStatusCode=error.codigo;
      throw (error);
    } else {
      const product = await productServices.obtenerProducto(productId);
      if (!product) {
        let error = CustomError.createCustomError(5);
        customStatusCode=error.codigo;
        throw (error);
      }

      // sp Validar que el owner sea compatible con el tipo de usuario y su email
      // en owner check : type of user and email

      if (req.session.usuario.typeofuser!=='admin' && product.owner !== req.session.usuario.email) {
        let error = CustomError.createCustomError(24);
        customStatusCode=error.codigo;
        throw (error);
      }
      if (esCorreoElectronico(product.owner)) {
        const useremail = product.owner;
        const sendermail = config.GMAIL_USER;
        const subject = 'Eliminación de un producto de su portfolio en Comercio Electrónico';
        const text = `Su producto con identificación ${product._id}, titulo ${product.title} y descripción ${product.description} ha sido eliminado de su portfolio. Saludos Cordiales`;
        await transport.sendMail({
          from: sendermail,
          to: useremail,
          subject: subject,
          text: text
        });
      }
      await productServices.eliminarProducto(productId)
      const options = {
        page: 1,
        limit: 10000000000000
      }
      updatedProducts = await productServices.obtenerProductos({},options);
      let error = CustomError.createCustomError(23);
      customStatusCode=error.codigo;
      return res.status(customStatusCode).json({ message: 'Producto eliminado', products: updatedProducts }) 
    }
  } catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(17);
      customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
};

// sp Función para validar el formato de un correo electrónico
// en Email format check function
function esCorreoElectronico(correo) {
  const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return expresionRegular.test(correo);
};

export default {getProducts, getProductById, crearProducto, actualizarProducto, borrarProducto, getMockingProducts };
