import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { getProfiles, updateProfile } from '../controllers/user.controller';
import * as orderController from '../controllers/order.controller';
import * as wishlistController from '../controllers/wishlist.controller';
import * as addressController from '../controllers/address.controller';
import * as reviewController from '../controllers/review.controller';
import { validate } from '../middleware/validate';
import { addressSchema, updateAddressSchema } from '../schemas/validation/address.schema';

const router = Router();

router.use(auth);

//Orders
router.get('/orders', orderController.getUserOrders);

//Wishlist
router.get('/wishlist', wishlistController.getWishlist);
router.post('/wishlist/toggle/:productId', wishlistController.toggleWishlist);

//Addresses
router.get('/addresses', addressController.getAddresses);
router.post('/addresses', validate(addressSchema), addressController.addAddress);
router.patch('/addresses/:id', validate(updateAddressSchema), addressController.updateAddress);

//Reviews
router.get('/reviews/:productId', reviewController.getReviews);
router.post('/reviews', reviewController.createReview);

export default router;
