import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { NotFoundError, ValidationError } from '../utils/errors';

const recommendationService = new RecommendationService();

export const getPersonalizedRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recommendations = await recommendationService.getPersonalizedRecommendations(
      req.user!.id
    );
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

export const getSimilarProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const similarProducts = await recommendationService.getSimilarProducts(Number(productId));
    res.json(similarProducts);
  } catch (error) {
    next(error);
  }
};
