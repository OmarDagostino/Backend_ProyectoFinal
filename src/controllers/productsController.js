import { ObjectId } from 'mongodb';
import { productServices } from '../services/productsServices.js';
import session from 'express-session';
import {Router} from 'express';
const router = Router ()
import bodyParser from 'body-parser';
router.use(bodyParser.urlencoded({ extended: true }));
import { body, validationResult } from 'express-validator';
import { generateProducts }  from '../util.js';
import { CustomError } from '../errorManagement/diccionarioDeErrores.js';

// sp: GET para retornar varios productos o todos
// en: GET return several products or all
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
// en: GET to return one specific product by ID
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
// en GET to return 100 facking products created by faker-js
async function getMockingProducts (req,res) {
  let products = [];
for (let i=0;i<100;i++) {
  products[i] = generateProducts ()
}
res.status(200).json(products);
}


// sp POST para crear un nuevo producto
// en post for creating a new product
async function crearProducto(req, res) {
  let customStatusCode =500            ;   
  try {
    
    let newProduct = req.body;
    if(req.session.usuario.typeofuser=='admin')
      {
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
  } catch (error) { console.error ('** Error **', error)
    if (customStatusCode===500) {
      
      let error = CustomError.createCustomError(20);
          customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
}


// sp PUT para actualizar un producto por su ID
// en PUT for updating a new product by ID
async function actualizarProducto (req, res) {
  
  let customStatusCode =500            ;   
  try {
    const productId = req.params.pid;
    const updatedProduct = req.body;


    // sp validar formato de las propiedades
    // en properties'check
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

    if (req.session.usuario.typeofuser!=='admin' && product.owner !== req.session.usuario.email) 
    {
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
// en Product delete by Id
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

    if (req.session.usuario.typeofuser!=='admin' && product.owner !== req.session.usuario.email) 
    {
      let error = CustomError.createCustomError(24);
      customStatusCode=error.codigo;
      throw (error);
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

export default {getProducts, getProductById, crearProducto, actualizarProducto, borrarProducto, getMockingProducts };
