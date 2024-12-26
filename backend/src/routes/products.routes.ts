import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  productFilterSchema,
} from '../schemas/validation/product.schema';
import {
  getProducts,
  getProductBySlug,
  getFilteredProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller';

const router = Router();

router.get('/', getProducts);
router.get('/filter', validate(productFilterSchema), getFilteredProducts);
router.get('/:slug', getProductBySlug);
router.post('/', auth, isAdmin, validate(createProductSchema), createProduct);
router.put('/:productId', auth, isAdmin, validate(updateProductSchema), updateProduct);
router.delete('/:productId', auth, isAdmin, deleteProduct);

export default router;
