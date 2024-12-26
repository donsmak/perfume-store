import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import {
  getPersonalizedRecommendations,
  getSimilarProducts,
} from '../controllers/recommendation.controller';

const router = Router();

router.use(auth);

router.get('/personalized', getPersonalizedRecommendations);
router.get('/similar/:productId', getSimilarProducts);

export default router;
