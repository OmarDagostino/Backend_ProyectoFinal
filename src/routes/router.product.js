import {Router} from 'express';
import { authAdmin } from '../middlewares/authMiddle.js';
import productsController from '../controllers/productsController.js'
import { body, validationResult } from 'express-validator';
const router = Router ()
import bodyParser from 'body-parser';
router.use(bodyParser.urlencoded({ extended: true }));

// sp GET para retornar varios productos o todos
// en GET to return several products or all of them
router.get('/products', productsController.getProducts);

// sp GET para retornar un producto por su ID
// en GET to return a product by ID
router.get('/products/:pid', productsController.getProductById);

// sp GET para retornar 100 productos imaginarios creados con Fake-js
// en GET to return 100 fake products created by Faker.js
router.get ('/mockingproducts', productsController.getMockingProducts)

// sp POST para crear un nuevo producto
// en POST to create a new product

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

  
// sp PUT para actualizar un producto por su ID
// en PUT to update a product by ID
router.put('/products/:pid',authAdmin, async (req,res)=> { 

  await productsController.actualizarProducto (req,res)
});

// sp DELETE para eliminar un producto por su ID
// en DELETE to erase a product by ID
router.delete('/products/:pid',authAdmin, productsController.borrarProducto);

export default router;
