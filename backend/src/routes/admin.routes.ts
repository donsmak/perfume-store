import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { isAuth, isAdmin } from '../middleware/';
import { validate } from '../middleware/';
import { updateUserRoleSChema } from '../schemas/validation/admin.schema';

const router = Router();
const adminController = new AdminController();

router.use(isAuth, isAdmin);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', validate(updateUserRoleSChema), adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/dashboard', adminController.getDashBoardStats);

export default router;
