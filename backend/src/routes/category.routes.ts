import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { cache } from '../middleware/cache.middleware';
import { auth, isAdmin } from '../middleware';
import { CACHE_TTL } from '../constants';

const router = Router();
const categoryController = new CategoryController();

router.get('/', cache(CACHE_TTL.LONG), categoryController.getAll);
router.get('/:slug', cache(CACHE_TTL.LONG), categoryController.getBySlug);

// Protected routes
router.post('/', auth, isAdmin, categoryController.create);
router.patch('/:id', auth, isAdmin, categoryController.update);

export default router;
