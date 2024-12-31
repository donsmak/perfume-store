import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/';
import { cache } from '../middleware/cache.middleware';
import { CACHE_KEYS, CACHE_TTL } from '../constants';
import {
  productFiltersRequest,
  createProductRequest,
  updateProductRequest,
  getProductRequest,
} from '../schemas/validation/product.schema';
import { isAuth } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();
const productController = new ProductController();

// Public routes
router.get(
  '/',
  validate(productFiltersRequest),
  cache(CACHE_TTL.MEDIUM, CACHE_KEYS.PRODUCTS),
  productController.getAll
);

router.get(
  '/:slug',
  validate(getProductRequest),
  cache(CACHE_TTL.LONG, CACHE_KEYS.PRODUCTS),
  productController.getBySlug
);

// Protected routes (admin only)
router.post('/', isAuth, isAdmin, validate(createProductRequest), productController.create);

router.patch('/:id', isAuth, isAdmin, validate(updateProductRequest), productController.update);

router.delete('/:id', isAuth, isAdmin, productController.delete);

export default router;
