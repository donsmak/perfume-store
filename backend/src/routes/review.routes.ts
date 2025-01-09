import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { isAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const reviewController = new ReviewController();

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', isAuth, reviewController.create);
router.put('/:id', isAuth, reviewController.update);
router.delete('/:id', isAuth, reviewController.delete);

export default router;
