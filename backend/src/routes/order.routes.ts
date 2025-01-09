import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { isAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrderRequest, getOrderRequest } from '../schemas/order.schema';

const router = Router();
const orderController = new OrderController();

router.post('/', isAuth, validate(createOrderRequest), orderController.createOrder);
router.get('/', isAuth, orderController.getOrders);
router.get('/:id', isAuth, validate(getOrderRequest), orderController.getOrderById);

export default router;
