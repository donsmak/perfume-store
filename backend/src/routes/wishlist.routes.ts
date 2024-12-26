import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller';

const router = Router();
router.use(auth);

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);

export default router;
