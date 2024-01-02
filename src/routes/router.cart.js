import {Router} from 'express';
import { authUser } from '../middlewares/authMiddle.js';
import cartsController from '../controllers/cartsController.js'

const router = Router ()

// Rutas para carritos

// GET para retornar un carrito por su ID
router.get('/carts/:cid', cartsController.getCarrito);

// POST para agregar un producto a un carrito existente
router.post('/carts/:cid/product/:pid',authUser, cartsController.agregarProducto);

// POST para crear un nuevo carrito
router.post('/carts/product/:pid',authUser, cartsController.crearCarrito);

// POST para hacer el proceso de compra
router.post('/carts/:cid/purchase', authUser, cartsController.procesoDeCompra);

// DELETE para eliminar un producto de un carrito 
router.delete('/carts/:cid/product/:pid',authUser, cartsController.eliminarProductoDelCarrito);

// DELETE para eliminar todos los productos de un carrito 
router.delete('/carts/:cid',authUser, cartsController.eliminarTodosProductosDelCarrito);

// PUT para actualizar la cantidad de un producto de un carrito existente
router.put('/carts/:cid/product/:pid',authUser, cartsController.actualizarCantidadDeUnProducto);


// PUT para actualizar todos los elementos de un carrito
router.put('/carts/:cid',authUser, cartsController.actualizarTodoElCarrito);

export default router;
