import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createReviewSchema, getReviewsSchema } from '../schemas/validation/review.schema';
import { createReview, getReviews } from '../controllers/review.controller';

const router = Router();

router.use(auth);
router.post('/', validate(createReviewSchema), createReview);
router.get('/:productId', validate(getReviewsSchema), getReviews);

export default router;
