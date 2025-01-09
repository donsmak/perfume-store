import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { isAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addItemSchema, removeItemSchema, updateItemSchema } from '../schemas/cart.schema';

const router = Router();
const cartController = new CartController();

router.get('/', isAuth, cartController.getCart);
router.post('/', isAuth, validate(addItemSchema), cartController.addItem);
router.put('/:id', isAuth, validate(updateItemSchema), cartController.updateItem);
router.delete('/:id', isAuth, validate(removeItemSchema), cartController.removeItem);
router.delete('/', isAuth, cartController.clearCart);

export default router;
