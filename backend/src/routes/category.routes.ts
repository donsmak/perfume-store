import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { isAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';
import { authorize } from '../middleware/authz.middleware';

const router = Router();
const categoryController = new CategoryController();

router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);
router.post(
  '/',
  isAuth,
  authorize(['admin']),
  validate(createCategorySchema),
  categoryController.create
);
router.put(
  '/:id',
  isAuth,
  authorize(['admin']),
  validate(updateCategorySchema),
  categoryController.update
);
router.delete('/:id', isAuth, authorize(['admin']), categoryController.delete);

export default router;
