import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middleware/';
import { cache } from '../middleware/cache.middleware';
import { CACHE_TTL, CACHE_KEYS } from '../constants';
import { createCategoryRequest, updateCategoryRequest } from '../schemas/validation/category.schema';
import { isAuth } from '../middleware';
import { isAdmin } from '../middleware/';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', cache(CACHE_TTL.LONG), categoryController.getAll);
router.get('/:slug', cache(CACHE_TTL.LONG), categoryController.getBySlug);

// Admin routes
router.post('/', isAuth, isAdmin, validate(createCategoryRequest), categoryController.create);
router.patch('/:id', isAuth, isAdmin, validate(updateCategoryRequest), categoryController.update);
router.delete('/:id', isAuth, isAdmin, categoryController.delete);

export default router;
