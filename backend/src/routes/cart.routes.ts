import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  createOrderSchema,
  removeFromCartSchema,
} from '../schemas/validation/cart.schema';
import {
  getCart,
  addToCart,
  removeFromCart,
  getCartTotal,
  createOrder,
} from '../controllers/cart.controller';

const router = Router();

router.use(auth);
router.get('/', getCart);
router.get('/total', getCartTotal);
router.post('/add', validate(addToCartSchema), addToCart);
router.post('/checkout', validate(createOrderSchema), createOrder);
router.delete('/remove/:itemId', validate(removeFromCartSchema), removeFromCart);

export default router;
