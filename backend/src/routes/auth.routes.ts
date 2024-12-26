import { Router } from 'express';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../schemas/validation/auth.schema';
import { register, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;
