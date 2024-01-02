import { ObjectId } from 'mongodb';
import { productServices } from '../services/productsServices.js';
import {cartModel} from '../models/cart.model.js';
import {cartsServices} from '../services/cartsServices.js'
import { ticketsServices } from '../services/ticketsServices.js';
import { usersServices } from '../services/usersServices.js';
import nodemailer from 'nodemailer';
import {config} from '../config/config.js'
import {CustomError } from '../errorManagement/diccionarioDeErrores.js';


const transport = nodemailer.createTransport({
  service:'gmail',
  port:config.PORT,
  auth:{
    user:config.GMAIL_USER,
    pass:config.GMAIL_PASS
  }
})
// sp GET para retornar un carrito por su ID
// en GET to return a cart by ID
async function getCarrito (req, res) {
  let customStatusCode =500 ;   
  try {
    const cartId = req.params.cid;
    const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
    if (!validObjectId) { 
      let error = CustomError.createCustomError(1);
      customStatusCode=error.codigo;
      throw (error);
      } else {
        const cart = await cartsServices.obtenerCarrito(cartId);
        if (cart) {
          res.status(200).json(cart);
        } else {
          let error = CustomError.createCustomError(2);
      customStatusCode=error.codigo;
      throw (error);
        }
      }
  } catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(3);
          customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
};

// sp POST para agregar un producto a un carrito existente
// en POST in order to add a product to en existing cart
async function agregarProducto(req, res) {
  let customStatusCode =500 ;   
  let validObjectId
  
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = 1;
    validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
    if (!validObjectId) 
    {       
      let error = CustomError.createCustomError(1);
      customStatusCode=error.codigo;
      throw (error);
    } 
    const cart = await cartsServices.obtenerCarritoSinPopulate(cartId);
    if (!cart) 
    {
      let error = CustomError.createCustomError(2);
      customStatusCode=error.codigo;
      throw (error);
    }

    // sp Añadir el producto al carrito
    // en add product to cart

    validObjectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;
    if (!validObjectId) 
    { 
      let error = CustomError.createCustomError(4);
      customStatusCode=error.codigo;
      throw (error);
    } 
    const existingProduct = cart.products.find((p) => p.productId == productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
        const product = await productServices.obtenerProducto(productId);
        if (product && product.owner == req.session.usuario.email) 
        {
            let error = CustomError.createCustomError(25);    
            customStatusCode=error.codigo;
            throw (error)
        }
        if (product && product.stock===0)
        {
          let error = CustomError.createCustomError(26)
          customStatusCode=error.codigo;
          throw (error);
        }
        if (product) 
        {            
            cart.products.push({ productId, quantity })
        } else {
              let error = CustomError.createCustomError(5);
              customStatusCode=error.codigo;
              throw (error);
            };
      }
            await cartsServices.actualizarCarrito(cart,cartId)
            let error = CustomError.createCustomError(6);
            customStatusCode=error.codigo;
            throw (error);
        }
      
   catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(7);
          customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  } }

// sp POST para crear un nuevo carrito
// en POST to create a new cart
async function crearCarrito(req, res) {
    let customStatusCode =500 ;   
  try {
      const productId = req.params.pid;
      const quantity = 1;
  
      // sp Verificar si el producto existe en la base de datos de productos
      // en product check register in product data base
      const validObjectId = ObjectId.isValid(productId) ? new ObjectId(productId) : null;
      if (!validObjectId) { 
        let error = CustomError.createCustomError(4);
      customStatusCode=error.codigo;
      throw (error);
        } else {
      const product = await obtenerProducto(productId);
  
      if (!product) {
        let error = CustomError.createCustomError(5);
      customStatusCode=error.codigo;
      throw (error);
      }
      if (product && product.stock===0)
        {
          let error = CustomError.createCustomError(26)
          customStatusCode=error.codigo;
          throw (error);
        }
  
      const newCart = new cartModel({
        products: [{ productId, quantity }]
      });
     
      await cartsServices.crearCarrito(newCart);
      let error = CustomError.createCustomError(8);
      customStatusCode=error.codigo;
      throw (error);
    }
    } catch (error) {
      if (customStatusCode===500) {
        let error = CustomError.createCustomError(9);
            customStatusCode=error.codigo;
      }
      res.status(customStatusCode).send(`${error.descripcion} `);
    }
  };

// sp POST para hacer el proceso de compra
// en POST for buying process

async function procesoDeCompra (req,res) {
  let customStatusCode =500 ;   
  try{ 
    const cartId = req.params.cid;
    const cart = await cartsServices.obtenerCarrito(cartId);
    
    if (!cart) {
      let error = CustomError.createCustomError(2);
      customStatusCode=error.codigo;
      throw (error);
    }
   let updatedCart = cart 
    // sp comprobacion de stock suficiente y actualizacion 
    // en stock check / update

    const productsToTicket = []
    const productsToWait = []

    for (let i=0; i < cart.products.length; i++)  {
      const ProductId = cart.products[i].productId._id 
      const Cantidad = cart.products[i].quantity
      const Precio = cart.products[i].productId.price
     
      let newStock=0
     
      if (cart.products[i].productId.stock >= cart.products[i].quantity) {   
          let itemDelTicket = {productId: ProductId, quantity: Cantidad, price: Precio}  
          productsToTicket.push(itemDelTicket)    
          newStock= cart.products[i].productId.stock - Cantidad     
      }
      else { 
        const Cantidad = cart.products[i].productId.stock 
        const CantidadRemanente = cart.products[i].quantity-cart.products[i].productId.stock
        
        if (Cantidad) { 
          const itemDelTicket = {productId: ProductId, quantity: Cantidad, price: Precio}  
          productsToTicket.push(itemDelTicket)}
          const itemRemanente = {ProductId: ProductId, Cantidad: CantidadRemanente}
        productsToWait.push(itemRemanente)    
      }     
      const producto = await productServices.obtenerProducto(ProductId)
      producto.stock = newStock
      await productServices.actualizarProducto(producto, ProductId)
    }
    // sp calculo del total del ticket 
    // en compute total ticket

    const totalTicket = productsToTicket.reduce((total, item) => {
      const subtotal = item.price * item.quantity;
      return total + subtotal;
    }, 0);


    // sp calculo de descuentos e impuestos 
    // en discount and taxes calculations

    const discounts = 0;
    const taxes = 0;
    const amount = totalTicket - discounts + taxes;

    // sp generacion del ticket de compra
    // en making a ticket
    let emailContent = ''
    let sendermail=''
    const user= await usersServices.obtenerUsuarioPorCartid (cartId)
    const userId = user._id
    const useremail = user.email

    
    if (productsToTicket.length!==0){
      let codigoMayor = await ticketsServices.obtenerCodigoMayor()
      codigoMayor++
      const codigo = codigoMayor.toString ()
      const newtickect = {
        products: productsToTicket,
        code:codigo,
        cartId:cartId,
        userId: userId,
        taxes: taxes ,
        discounts: discounts,
        amount: amount,
      }

    ticketsServices.crearTicket(newtickect)
    
    // sp envio de correo al usuario con el ticket de compra
    // en ticket email sending 
  
    const useremail = user.email
    const sendermail = config.GMAIL_USER
        
    let subject = `Ticket de compra ${codigo}`
   
    let emailContent = '<table border="1"><tr><th>Identificador del Producto</th><th>Cantidad</th><th>Precio</th></tr>';
    productsToTicket.forEach(item => {
        emailContent += `<tr><td>${item.productId}</td><td>${item.quantity}</td><td>${item.price}</td></tr>`;
        });
       
    emailContent += '</table>';
   
    await transport.sendMail({
      from:sendermail,
      to:useremail,
      subject:subject,
     html: `<h3> Gracias por su compra </h3> 
          <h4> El total de su compra es : </h4> 
          ${amount}
          <h4> El detalle de su compra es el siguiente : <h4>
          ${emailContent}
          `
    });
  }
    
    // sp actualizar carrito con los productos pendientes sin stock 
    // en cart update with the pending products (with insuficient stock)
    updatedCart.products = []; 

if (productsToWait.length > 0) {
  for (let n = 0; n < productsToWait.length; n++) {
    
    const itemToWait = {
      quantity: productsToWait[n].Cantidad,
      productId: productsToWait[n].ProductId
    };
    updatedCart.products.push(itemToWait); 
  }
}

      
      cartsServices.actualizarCarrito (updatedCart,cartId)

    // sp enviar mail del carrito pendiente de stock 
    // en remaining products cart email 
    
    if (productsToTicket.length !== 0 )  {
        let subject = `Carrito de compra ${cartId}`
        emailContent = '<table border="1"><tr><th>Identificador del Producto</th><th>Cantidad</th></tr>';
        productsToWait.forEach(item => {
            emailContent += `<tr><td>${item.ProductId}</td><td>${item.Cantidad}</td></tr>`;
            });
          
        emailContent += '</table>';
      
        await transport.sendMail({
          from:sendermail,
          to:useremail,
          subject:subject,
        html: `<h3> Lamentablemente no tenemos suficiente stock para cumplir con la totalidad de su pedido </h3> 
              
              <h4> El detalle de los items pendientes es el siguiente : <h4>
              ${emailContent}
              `
        });
      } 
    let mensaje = ''
    if (productsToWait.length===0 & productsToTicket.length >0) { mensaje = 'Compra exitosa'}
    if (productsToWait.length> 0 & productsToTicket.length === 0) { mensaje = 'Todos los productos seleccionados no tienen staock, intentelo en otro momento'}
    if (productsToWait.length> 0 & productsToTicket.length >0 ) {mensaje = 'Algunos productos seleccionados no tenian stock suficiente, la compra fue efectuada , pero los remanentes quedan esperando existencias, intentelo en otro momento'}
    if (productsToWait.length===0 & productsToTicket.length === 0) { mensaje = 'Carrito vacío'}
    return res.redirect(`/carts?mensaje=${mensaje}`)
  } catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(10);
          customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
}

// sp DELETE para eliminar un producto de un carrito 
// en product erase from a cart
async function eliminarProductoDelCarrito (req, res) {
  let customStatusCode =500 ;   
  try {
    const cartId = req.params.cid;
    const productIdToFind = req.params.pid;

    const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
    if (!validObjectId) { 
      let error = CustomError.createCustomError(1);
      customStatusCode=error.codigo;
      throw (error);
      } else {

        const cart = await cartsServices.obtenerCarrito(cartId);

        if (!cart) {
          let error = CustomError.createCustomError(2);
      customStatusCode=error.codigo;
      throw (error);
        }

        const validObjectId = ObjectId.isValid(productIdToFind) ? new ObjectId(productIdToFind) : null;

        if (!validObjectId) { 
          let error = CustomError.createCustomError(4);
      customStatusCode=error.codigo;
      throw (error);
          } 
          else {
            const indice  = cart.products.findIndex((product) => String(product.productId._id) === String(productIdToFind));
            if (indice!==-1) {
            cart.products.splice(indice,1)
            }
            else {
                  let error = CustomError.createCustomError(11);
      customStatusCode=error.codigo;
      throw (error);
            };
          }

            await cartsServices.actualizarCarrito (cart,cartId);
            let error = CustomError.createCustomError(6);
      customStatusCode=error.codigo;
      throw (error);
        }
      
  } catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(12);
          customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }};

// sp DELETE para eliminar todos los productos de un carrito 
// en all product erase from a cart
async function eliminarTodosProductosDelCarrito (req, res) {
    let customStatusCode =500 ;   
  try {
      const cartId = req.params.cid;

      const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
      if (!validObjectId) { 
        let error = CustomError.createCustomError(1);
      customStatusCode=error.codigo;
      throw (error);
        } else {

          const cart = await cartsServices.obtenerCarrito(cartId);

          if (!cart) {
            let error = CustomError.createCustomError(2);
      customStatusCode=error.codigo;
      throw (error);
          } else {
            cart.products.length=0;
            await cartsServices.actualizarCarrito(cart,cartId);
            let error = CustomError.createCustomError(6);
      customStatusCode=error.codigo;
      throw (error);
          }

        }
      }
      catch (error) {
        if (customStatusCode===500) {
          let error = CustomError.createCustomError(13);
              customStatusCode=error.codigo;
        }
        res.status(customStatusCode).send(`${error.descripcion} `);
      }
  };

// sp PUT para actualizar la cantidad de un producto de un carrito existente
// en PUT to update product quatity in a specific  cart
async function actualizarCantidadDeUnProducto(req, res) {
  let customStatusCode =500 ;   
  try {
    const cartId = req.params.cid;
    const productIdToFind = req.params.pid;
    const cantidad = parseInt(req.body.quantity);
    if (isNaN(cantidad) || cantidad<=0) {
      let error = CustomError.createCustomError(14);
      customStatusCode=error.codigo;
      throw (error);
    
    }
    const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
    if (!validObjectId) { 
      let error = CustomError.createCustomError(1);
      customStatusCode=error.codigo;
      throw (error);
      } else {        
        const cart = await cartsServices.obtenerCarrito(cartId);
        if (!cart) {
          let error = CustomError.createCustomError(2);
      customStatusCode=error.codigo;
      throw (error);
        }
        const indice  = cart.products.findIndex((product) => String(product.productId) === productIdToFind);
            if (indice!==-1) {    
              cart.products[indice].quantity=cantidad;
              await cartsServices.actualizarCarrito(cart,cartId);
              let error = CustomError.createCustomError(6);
      customStatusCode=error.codigo;
      throw (error);
            } else { 
              let error = CustomError.createCustomError(11);
      customStatusCode=error.codigo;
      throw (error);                   
            };
      }
  }
  catch (error) {
    if (customStatusCode===500) {
      let error = CustomError.createCustomError(7);
          customStatusCode=error.codigo;
    }
    res.status(customStatusCode).send(`${error.descripcion} `);
  }
};


// sp PUT para actualizar todos los elementos de un carrito
// en PUT to update the whole cart
async function actualizarTodoElCarrito(req, res) {
  let customStatusCode =500 ;   
  try {
    const cartId = req.params.cid;
    const nuevoCarrito = req.body;    
    const validObjectId = ObjectId.isValid(cartId) ? new ObjectId(cartId) : null;
    if (!validObjectId) { 
      let error = CustomError.createCustomError(1);
      customStatusCode=error.codigo;
      throw (error);
      return;
      }        
    const cart = await cartsServices.obtenerCarrito(cartId);
    if (!cart) {
          let error = CustomError.createCustomError(2);
      customStatusCode=error.codigo;
      throw (error);
      }
  
  if (Array.isArray(nuevoCarrito.products) && nuevoCarrito.products.length > 0) {
  
    const validacionExitosa = await Promise.all(
      nuevoCarrito.products.map(async (item) => {
              
        if (!ObjectId.isValid(item.productId)) { 
         
          return false; 
        }
     
        const productExists = await productServices.obtenerProducto(item.productId); 
 
        return productExists && typeof item.quantity === 'number' && item.quantity > 0;
      })
    );

    if (validacionExitosa.every((isValid) => isValid)) {
      cart.products=nuevoCarrito.products
    
      await cartsServices.actualizarCarrito(cart,cartId);
      let error = CustomError.createCustomError(6);
      customStatusCode=error.codigo;
      throw (error);
    } else {
      let error = CustomError.createCustomError(14);
      customStatusCode=error.codigo;
      throw (error);
    }
  } else {
    let error = CustomError.createCustomError(14);
      customStatusCode=error.codigo;
      throw (error);
  }
      }
      catch (error) {
        if (customStatusCode===500) {
          let error = CustomError.createCustomError(7);
              customStatusCode=error.codigo;
        }
        res.status(customStatusCode).send(`${error.descripcion} `);
      }
};


export default {getCarrito ,agregarProducto, crearCarrito,eliminarProductoDelCarrito ,procesoDeCompra, eliminarTodosProductosDelCarrito, actualizarCantidadDeUnProducto, actualizarTodoElCarrito } 
