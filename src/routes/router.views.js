import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import {authUser,authAdmin, auth,auth2 } from '../middlewares/authMiddle.js';
import { validaJWT } from '../middlewares/validaJWT.js';
import __dirname from '../util.js';
import {cartModel} from '../models/cart.model.js';
import {productModel} from '../models/product.model.js';
import { userModel } from '../models/user.model.js';
import { ObjectId } from 'mongodb';

const router = express.Router()
const app = express();
app.engine('handlebars',handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));

// sp *************************************************************************************************
// sp  mostrarMenu maneja la renderizacion de los items del menu segun corresponda (con true o false)
// sp
// sp           0 => Home
// sp           1 => Registro
// sp           2 => Login
// sp           3 => Login con Git Hub
// sp           4 => Mostrar datos del usuario
// sp           5 => Productos
// sp           6 => Carrito 
// sp           7 => Logout
// sp           8 => volver al menu del administrador
// sp           9 => Chat de usuarios
// sp           10 => menu de usuario premium
// sp           11 => Subir archivos de documentos y/o imagenes (usuario o producto)

// en *************************************************************************************************
// en  mostrarMenu manage items menu renderization acording to bolean values
// en
// en           0 => Home
// en           1 => Registro
// en           2 => Login
// en           3 => Login con Git Hub
// en           4 => Mostrar datos del usuario
// en           5 => Productos
// en           6 => Carrito 
// en           7 => Logout
// en           8 => volver al menu del administrador
// en           9 => Chat de usuarios
// en           10 => menu de usuario premium
// en           11 => Subir archivos de documentos y/o imagenes (usuario o producto)

let mostrarMenu0 = true;                 
let mostrarMenu1 = true;
let mostrarMenu2 = true;
let mostrarMenu3 = true;
let mostrarMenu4 = true;
let mostrarMenu5 = true;
let mostrarMenu6 = true;
let mostrarMenu7 = true;
let mostrarMenu8 = true;
let mostrarMenu9 = true;
let mostrarMenu10 = true;
let mostrarMenu11 = true;
let menuArray = []

function menuManagement (req,res,menuArray) {
mostrarMenu0 = menuArray[0]== 0 ? false : true;
mostrarMenu1 = menuArray[1]== 0 ? false : true;
mostrarMenu2 = menuArray[2]== 0 ? false : true;
mostrarMenu3 = menuArray[3]== 0 ? false : true;
mostrarMenu4 = menuArray[4]== 0 ? false : true;
mostrarMenu5 = menuArray[5]== 0 ? false : true;
mostrarMenu6 = menuArray[6]== 0 ? false : true;
mostrarMenu7 = menuArray[7]== 0 ? false : true;
mostrarMenu8 = menuArray[8]== 0 ? false : true;
mostrarMenu9 = menuArray[9]== 0 ? false : true;
mostrarMenu11 = menuArray[11]== 0 ? false : true;

if (!req.session.usuario) {
  mostrarMenu10 = false
} else {
  if (req.session.usuario.typeofuser == 'premium') {
    mostrarMenu10 = true
  } else {
    mostrarMenu10 =false
  }}
}
// sp ***********************************************************************************************
// en ***********************************************************************************************


// sp ruta para la vista de Home Page
// en Home page view 
router.get('/', auth, (req,res)=>{
 
  menuManagement (req,res,[0,1,1,1,1,1,1,1,0,1,1,1])
  let typeofuser=req.session.usuario.typeofuser

  res.setHeader('Content-Type','text/html');
  res.status(200).render('home',{typeofuser,mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
});

// sp ruta para la vista del usuario Premium
// en Premium user view
router.get('/premium', auth, (req,res)=>{
  
  menuManagement (req,res,[1,0,0,0,1,1,1,1,1,0,0,1])
  let typeofuser=req.session.usuario.typeofuser
  const name= req.session.usuario.name
  res.setHeader('Content-Type','text/html');
  res.status(200).render('premium',{typeofuser,name, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
});

// sp ruta para subida de archivos
// en upload form
router.get('/upload',auth, (req,res)=> {
  let uid = req.session.usuario._id
  let typeofuser = req.session.usuario.typeofuser
  menuManagement (req,res,[1,0,0,0,1,1,1,1,0,1,0,0])
  res.status(200).render('upload',{typeofuser,uid, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11} )
})

// sp ruta para la vista del administrador
// en administrator view
router.get('/admin', authAdmin, (req,res)=>{
   
  menuManagement (req,res,[0,0,0,0,0,0,0,1,0,0,0,0])
  let typeofuser=req.session.usuario.typeofuser
  res.setHeader('Content-Type','text/html');
  res.status(200).render('admin',{typeofuser,mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
});

// sp ruta para la vista de visualizar productos para el administrador o usuario premium
// en Product view for administrator o premium users
router.get('/visualizarProductos',auth,async (req,res)=> {
  
  menuManagement (req,res,[0,0,0,0,0,0,0,1,1,0,0,0])
  let typeofuser=req.session.usuario.typeofuser;
  let product
  if (typeofuser=='premium') {
    product = await productModel.find({owner:req.session.usuario.email}).exec();
  } else { 
    product = await productModel.find({}).exec();
  }
  
  const renderedProducts = product.map(product => {
    return {
          _id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          code: product.code,
          category: product.category,
          stock: product.stock,
          owner:product.owner
  }})

  res.setHeader('Content-Type','text/html');
  res.status(200).render('visualizarProductos',{renderedProducts, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
})

// sp ruta para mostrar los usuarios al administrador 
// en users view prompt for administrator

router.get('/visualizarUsuarios',authAdmin, async (req,res)=>{
 
  menuManagement (req,res,[0,0,0,0,0,0,0,1,1,0,0,0])

  const usersToR = await  userModel.find({}).exec();
  const usersToRender = usersToR.map(usersToR => {
    return {
      _id: usersToR._id,
      name: usersToR.name,
      last_name: usersToR.last_name,
      typeofuser: usersToR.typeofuser,
      email: usersToR.email,
      age: usersToR.age,
      cartId: usersToR.cartId,
      last_connection: usersToR.last_connection
    }
  })
  let typeofuser=req.session.usuario.typeofuser;
  res.setHeader('Content-Type','text/html');
  res.status(200).render('visualizarUsuarios',{usersToRender,typeofuser,mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});

})

// sp ruta para mostrar los usuarios al administrador para hacerle mantenimiento 
// en mintenece users view for administrator 
router.get('/mantenimientoUsuarios',authAdmin, async (req,res)=>{
 
  menuManagement (req,res,[0,0,0,0,0,0,0,1,1,0,0,0])

  const usersToR = await  userModel.find({}).exec();
  const usersToRender = usersToR.map(usersToR => {
    return {
      _id: usersToR._id,
      name: usersToR.name,
      last_name: usersToR.last_name,
      typeofuser: usersToR.typeofuser,
      email: usersToR.email,
      age: usersToR.age,
      cartId: usersToR.cartId,
      last_connection: usersToR.last_connection
    }
  })
  let typeofuser=req.session.usuario.typeofuser;
  res.setHeader('Content-Type','text/html');
  res.status(200).render('mantenimientoUsuarios',{usersToRender,typeofuser,mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
})

// sp ruta para depurar usuarios inactivos
// en debug users butom view

router.get('/depurarUsuarios',authAdmin,async (req,res)=> {
  menuManagement (req,res,[0,0,0,0,0,0,0,1,1,0,1,0])
  let typeofuser=req.session.usuario.typeofuser;
  res.setHeader('Content-Type','text/html');
  res.render('depurarUsuarios',{typeofuser,mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});

})

// sp ruta para crear producto nuevo
// en New product creation
router.get('/crearProducto',auth,async (req,res)=> {
 
  menuManagement (req,res,[0,0,0,0,0,0,0,1,1,0,1,0])
  let typeofuser=req.session.usuario.typeofuser;
  
  let error= false
  let errorDetail = ''
  if (req.query.error){
    error=true,
    errorDetail=req.query.error
  }
  res.setHeader('Content-Type','text/html');   
  if (error) {res.status(400).render('crearProducto',{error,errorDetail, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
  } else {
    {res.status(200).render('crearProducto',{error,errorDetail, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});}
  }
})

// sp ruta para modificar productos
// en product update
router.get('/modificarProductos',auth,async (req,res)=> {
  
  menuManagement (req,res,[0,0,0,0,0,0,0,1,1,0,1,0])
  let typeofuser=req.session.usuario.typeofuser;
  let error= false
  let errorDetail = ''
  if (req.query.error){
    error=true,
    errorDetail=req.query.error
  }
  let product
  if (typeofuser=='premium') {
    product = await productModel.find({owner:req.session.usuario.email}).exec();
  } else { 
    product = await productModel.find({}).exec();
  }
  const renderedProducts = product.map(product => {
    return {
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      code: product.code,
      category: product.category,
      stock: product.stock,
      owner:product.owner
    }
  });
  res.setHeader('Content-Type','text/html');   
  if (error) {res.status(400).render('modificarProductos',{renderedProducts,error,errorDetail, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
  } else {
    {res.status(200).render('modificarProductos',{renderedProducts,error,errorDetail, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11}); }
  }
})

// sp ruta para modificar un producto
// en products update
router.get('/modificarProducto',auth,async (req,res)=> {
 
  menuManagement (req,res,[0,0,0,0,0,0,0,1,1,0,1,0])
  let typeofuser=req.session.usuario.typeofuser;
  
  let error= false
  let errorDetail = ''
  if (req.query.error){
    error=true,
    errorDetail=req.query.error
  }
  let productId=req.query.productId
  const product = await productModel.findOne({ _id: productId }).exec();
  
  const code=product.code
  const title=product.title
  const description=product.description
  const price= product.price
  const stock= product.stock
  const category=product.category
  const status=product.status
  const thumbnail = product.thumbnail
  res.setHeader('Content-Type','text/html');   
  res.status(200).render('modificarProducto',{code,title,description,price,stock,category,status,thumbnail,productId,error,errorDetail, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});

})

// sp ruta para eliminar un producto 
// en product delete
router.get('/borrarProductos',auth,async (req,res)=> {
  
  menuManagement (req,res,[0,0,0,0,0,0,0,1,1,0,1,0])
  let typeofuser=req.session.usuario.typeofuser;
  
  let error= false
  let errorDetail = ''
  if (req.query.error){
    error=true,
    errorDetail=req.query.error
  }
  let product
  if (typeofuser=='premium') {
    product = await productModel.find({owner:req.session.usuario.email}).exec();
  } else { 
    product = await productModel.find({}).exec();
  }
  const renderedProducts = product.map(product => {
    return {
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      code: product.code,
      category: product.category,
      stock: product.stock,
      owner:product.owner
    }
  });

  res.setHeader('Content-Type','text/html');   
  if (error) {res.status(400).render('borrarProductos',{renderedProducts,error,errorDetail, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
  } else {
    {res.status(200).render('borrarProductos',{renderedProducts,error,errorDetail, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});}
  }
})

// sp ruta para la vista del LOGIN
// en Login view
router.get('/login', auth2, (req,res)=>{
 
  menuManagement (req,res,[0,1,0,1,0,0,0,0,0,0,0,0])
  let typeofuser='' ;
  let error= false
  let errorDetail = ''
  if (req.query.error){
    error=true,
    errorDetail=req.query.error
  }
  res.setHeader('Content-Type','text/html');
  res.status(200).render('login',{error,errorDetail,typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
});

// sp ruta para solicitar la recuperacion de la contraseña
// en re-start password requirement
router.get('/forgot', auth2, (req,res,mostrarMensaje,mensaje)=>{
 
  menuManagement (req,res,[0,1,0,1,0,0,0,0,0,0,0,0])
  let typeofuser='' ;
  let error= false
  let errorDetail = ''
  if (req.query.error){
    error=true,
    errorDetail=req.query.error
  }
  res.setHeader('Content-Type','text/html');
  res.status(200).render('forgot',{error,errorDetail,typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11, mostrarMensaje,mensaje});
});

// sp ruta para recuperar la contraseña 
// en Password re-start

router.get('/recupera',validaJWT,(req,res)=>{

let usuario=req.decoded.email
res.setHeader('Content-Type','text/html');
res.status(200).render('recupera',{usuario})
})

// sp ruta para la vista del LOGIN con github
// en Git Hub Login view
router.get('/loginGitHub', auth2, (req,res)=>{
  
  menuManagement (req,res,[0,1,1,0,0,0,0,0,0,0,0,0])
  let typeofuser='' ;
  let error= false
  let errorDetail = ''
  if (req.query.error){
    error=true,
    errorDetail=req.query.error
  }
  res.setHeader('Content-Type','text/html');
  res.status(200).render('loginGitHub',{error,errorDetail,typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
});


// sp ruta para la vista del registro de usuario
// en User registration view
router.get('/registro',auth2,  (req,res)=>{
  
  menuManagement (req,res,[0,0,1,1,0,0,0,0,0,0,1,0])
  let typeofuser='';
  let error= false
  let errorDetail = ''
  if (req.query.error){
    error=true,
    errorDetail=req.query.error
  }
    res.setHeader('Content-Type','text/html');
    res.status(200).render('registro',{error, errorDetail, typeofuser,mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
})

// sp ruta para mostrar el registro del usuario que hizo login
// en user data 
router.get('/current1',auth,  (req,res)=>{
 
  menuManagement (req,res,[1,0,0,0,0,1,1,1,0,1,1,1])

  // sp DTO de datos del usuario
  // en DTO users 

  let name=req.user.name
  let last_name= req.user.last_name
  let email=req.user.email
  let age=req.user.age
  let cartId=req.user.cartId
  let typeofuser=req.user.typeofuser
  let upgrade = false
  if (typeofuser==="user") { upgrade= true}
  res.setHeader('Content-Type','text/html');
  res.status(200).render('current1',{upgrade, name, last_name, email, age, cartId,typeofuser,mostrarMenu0,typeofuser,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
})

// sp ruta para el chat
// en chat route
router.get('/chat',authUser, (req,res)=> {
  
  menuManagement (req,res,[1,0,0,0,0,1,1,1,0,0,1,1])
  let email=req.user.email 
  res.setHeader('Content-Type','text/html');
  res.status(200).render('chat',{email,mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11});
})

// sp ruta para mostrar los productos a un usuario
// en product prompt for users (main view)
router.get('/products', auth,  async (req,res) => {
  try {
    const name = req.session.usuario.name
    const cartId = req.session.usuario.cartId
    const product = await productModel.find({}).exec();
    const renderedProducts = product.map(product => {
      return {
        _id: product._id,
        title: product.title,
        description: product.description,
        price: product.price,
        code: product.code,
        category: product.category,
        stock: product.stock,
        owner: product.owner
      };
      
    });
    res.setHeader('Content-Type', 'text/html');
    menuManagement (req,res,[1,0,0,0,1,0,1,1,0,1,1,1])
    let typeofuser=req.session.usuario.typeofuser;
    res.status(200).render('products', { renderedProducts,name, cartId, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11}); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
})
 
// sp Ruta para mostrar el contenido de un carrito por su _id
// en shows cart content by cart Id
router.get('/carts/:cid',  async (req,res)  => { 
  try {
    const cartId = req.params.cid;
    const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
    if (!validObjectId) { 
      res.status(404).send("Identificador del carrito invalido");
    } else {
      const cart = await cartModel.findOne({ _id : cartId }).populate('products.productId').exec();
      if (cart) {  
        const transformedCart = {
          cartId,
          products: cart.products.map(product => ({
            productId: product.productId._id,
            title: product.productId.title,
            description: product.productId.description,
            price: product.productId.price,
            code: product.productId.code,
            stock: product.productId.stock,
            category: product.productId.category,
            cantidad: product.quantity,
          })),
        }; 
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('carts', { cart: transformedCart});
      } else {
        res.status(404).send('Carrito no encontrado');
      }
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('*** Error en el servidor');
  }
});

// sp ruta para mostrar el contenido del carrito del usuario que hizo Login
// en show cart content of user session
router.get('/carts', auth, async (req,res)  => { 
  try {
    const cartId = req.session.usuario.cartId;
    const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
    if (!validObjectId) { 
      res.status(404).send("Identificador del carrito invalido");
    } else {
      const cart = await cartModel.findOne({ _id : cartId }).populate('products.productId').exec();
      if (cart) {    
        const transformedCart = {
          cartId,
          products: cart.products.map(product => ({
            productId: product.productId._id,
            title: product.productId.title,
            description: product.productId.description,
            price: product.productId.price,
            code: product.productId.code,
            stock: product.productId.stock,
            category: product.productId.category,
            cantidad: product.quantity,
          })),
        };
        menuManagement (req,res,[1,0,0,0,1,1,0,1,0,1,1,1])
        let typeofuser=req.session.usuario.typeofuser;
        let mensaje= req.query.mensaje
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('carts', { cart: transformedCart, mensaje, typeofuser, mostrarMenu0,mostrarMenu1,mostrarMenu2,mostrarMenu3,mostrarMenu4,mostrarMenu5,mostrarMenu6,mostrarMenu7,mostrarMenu8,mostrarMenu9,mostrarMenu10,mostrarMenu11 });
      } else {
        res.status(404).send('Carrito no encontrado');
      }
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('*** Error en el servidor ***');
  }
 
});
export default router