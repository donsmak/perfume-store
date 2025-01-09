import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { validate } from '../middleware';
import { isAuth } from '../middleware/auth.middleware';
import { createAddressRequest, updateAddressRequest } from '../schemas/address.schema';

const router = Router();
const addressController = new AddressController();

router.use(isAuth);

router.get('/', addressController.getAll);

router.post('/', validate(createAddressRequest), addressController.create);

router.put('/:id', validate(updateAddressRequest), addressController.update);

router.delete('/:id', addressController.delete);

router.patch('/:id/default', addressController.setDefault);

export default router;
