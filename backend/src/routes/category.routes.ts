import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { cache } from '../middleware/cache.middleware';
import { CACHE_TTL } from '../constants';

const router = Router();
const categoryController = new CategoryController();

router.get('/', cache(CACHE_TTL.LONG), categoryController.getAll);
router.get('/:slug', cache(CACHE_TTL.LONG), categoryController.getBySlug);

export default router;
