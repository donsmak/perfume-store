import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware';
import {
  registerRequest,
  loginRequest,
  resetPasswordRequest,
  resetPasswordSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../schemas/auth.schema';
import { isAuth } from '../middleware';
import { loginRateLimiter } from '../middleware/rateLimit.middleware';
const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerRequest), authController.register);
router.post('/login', loginRateLimiter, authController.login);

router.get('/verify-email', authController.verifyEmail);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/forget-password', validate(resetPasswordRequest), authController.forgetPassword);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', isAuth, authController.logout);

router.get('/profile', isAuth, authController.getProfile);
router.put('/profile', isAuth, validate(updateProfileSchema), authController.updateProfile);
router.put(
  '/change-password',
  isAuth,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;
