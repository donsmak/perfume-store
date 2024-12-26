import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate';
import { updateOrderStatusSchema } from '../schemas/validation/order.schema';
import { createProductSchema, updateProductSchema } from '../schemas/validation/product.schema';
import * as orderController from '../controllers/order.controller';
import * as productController from '../controllers/products.controller';
import * as userController from '../controllers/user.controller';

const router = Router();

router.use(auth, isAdmin);

// Dashboard
router.get('/dashboard', userController.getDashboardStats);

// User management
router.get('/users', userController.getAllUsers);
router.patch('/users/:userId/role', userController.updateUserRole);

router.patch(
  '/products/:productId',
  validate(updateProductSchema),
  productController.updateProduct
);

// Order management
router.get('/orders', orderController.getAllOrders);
router.patch(
  '/orders/:orderId',
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;
