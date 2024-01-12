import {Router} from 'express';
import { authUser } from '../middlewares/authMiddle.js';
import cartsController from '../controllers/cartsController.js'

const router = Router ()

// sp Rutas para carritos
// en Cart routes

// sp GET para retornar un carrito por su ID
// en Get a cart by Id
router.get('/carts/:cid', cartsController.getCarrito);

// sp POST para agregar un producto a un carrito 
// en POST to add a product into a car
router.post('/carts/:cid/product/:pid',authUser, cartsController.agregarProducto);

// sp POST para crear un nuevo carrito
// en POST to create a new cart
router.post('/carts/product/:pid',authUser, cartsController.crearCarrito);

// sp POST para hacer el proceso de compra
// en POST to launch purchase process
router.post('/carts/:cid/purchase', authUser, cartsController.procesoDeCompra);

// sp DELETE para eliminar un producto de un carrito
// en DELETE to erase a product from a cart 
router.delete('/carts/:cid/product/:pid',authUser, cartsController.eliminarProductoDelCarrito);

// sp DELETE para eliminar todos los productos de un carrito
// en DELETE to erase all products from a cart 
router.delete('/carts/:cid',authUser, cartsController.eliminarTodosProductosDelCarrito);

// sp PUT para actualizar la cantidad de un producto de un carrito existente
// en PUT to update quantity of a product into a cart
router.put('/carts/:cid/product/:pid',authUser, cartsController.actualizarCantidadDeUnProducto);


// sp PUT para actualizar todos los elementos de un carrito
// en PUT to update all items into a cart
router.put('/carts/:cid',authUser, cartsController.actualizarTodoElCarrito);

export default router;
