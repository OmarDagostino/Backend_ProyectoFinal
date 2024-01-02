import {Router} from 'express';
import { authAdmin } from '../middlewares/authMiddle.js';
import productsController from '../controllers/productsController.js'
import { body, validationResult } from 'express-validator';

const router = Router ()

import bodyParser from 'body-parser';

router.use(bodyParser.urlencoded({ extended: true }));

// GET para retornar varios productos o todos
router.get('/products', productsController.getProducts);

// GET para retornar un producto por su ID
router.get('/products/:pid', productsController.getProductById);

// GET para retornar 100 productos imaginarios creados con Fake-js
router.get ('/mockingproducts', productsController.getMockingProducts)

// POST para crear un nuevo producto

router.post('/products',authAdmin,
  [
    body('title').notEmpty().withMessage('El título es requerido').isString(),
    body('description').notEmpty().withMessage('La descripción es requerida').isString(),
    body('code').notEmpty().withMessage('El código es requerido').isString(),
    body('price').notEmpty().withMessage('El precio es requerido').isNumeric(),
    body('stock').notEmpty().withMessage('El stock es requerido').isNumeric(),
    body('category').notEmpty().withMessage('La categoría es requerida').isString(),
    body('status').optional().isBoolean().withMessage('El status debe ser true o false'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        param: error.path,
        msg: error.msg,
      }));
      return res.status(400).json({ errors: formattedErrors });
    }
    productsController.crearProducto(req, res);
  }
);

  
// PUT para actualizar un producto por su ID
router.put('/products/:pid',authAdmin, async (req,res)=> { 

  await productsController.actualizarProducto (req,res)
});

// DELETE para eliminar un producto por su ID
router.delete('/products/:pid',authAdmin, productsController.borrarProducto);

export default router;
