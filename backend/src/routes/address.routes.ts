import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { addressSchema, updateAddressSchema, addressIdSchema } from '../schemas/validation/address.schema';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller';

const router = Router();

router.use(auth);

router.get('/', getAddresses);
router.post('/', validate(addressSchema), addAddress);
router.put('/:id', validate(updateAddressSchema), updateAddress);
router.delete('/:id', validate(addressIdSchema), deleteAddress);

export default router;
