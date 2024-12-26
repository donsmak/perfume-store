import { getProfiles, updateProfile } from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/profile', auth, getProfiles);
router.put('/profile', auth, updateProfile);

export default router;
