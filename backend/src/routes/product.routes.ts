import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { getFromCache } from '../middleware/cache.middleware';
import { CACHE_KEYS } from '../constants';
import {
  productFiltersRequest,
  createProductRequest,
  updateProductRequest,
  getProductRequest,
} from '../schemas/product.schema';
import { isAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authz.middleware';

const router = Router();
const productController = new ProductController();

// Public routes
router.get(
  '/',
  validate(productFiltersRequest),
  getFromCache(CACHE_KEYS.PRODUCTS),
  productController.getAll
);

router.get('/:slug', validate(getProductRequest), productController.getBySlug);

// Protected routes (admin only)
router.post(
  '/',
  isAuth,
  authorize(['admin']),
  validate(createProductRequest),
  productController.create
);

router.patch(
  '/:id',
  isAuth,
  authorize(['admin']),
  validate(updateProductRequest),
  productController.update
);

router.delete('/:id', isAuth, authorize(['admin']), productController.delete);

export default router;
