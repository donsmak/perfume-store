import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate';
import { createDiscountSchema } from '../schemas/validation/discount.schema';
import { createDiscount, getDiscounts, validateDiscount } from '../controllers/discount.controller';

const router = Router();

router.get('/', getDiscounts);
router.post('/validate', auth, validateDiscount);

// Admin routes
router.post('/create', auth, isAdmin, validate(createDiscountSchema), createDiscount);

export default router;
