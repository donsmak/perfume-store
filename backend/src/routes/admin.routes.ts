import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { isAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authz.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserRoleSChema } from '../schemas/admin.schema';

const router = Router();
const adminController = new AdminController();

router.use(isAuth, authorize(['admin']));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', validate(updateUserRoleSChema), adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/dashboard', adminController.getDashBoardStats);

export default router;
