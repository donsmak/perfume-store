import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware';
import { registerRequest, loginRequest } from '../schemas/validation/auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerRequest), authController.register);
router.post('/login', validate(loginRequest), authController.login);

export default router;
