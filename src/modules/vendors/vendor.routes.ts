import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { VendorController } from './vendor.controller'
import {
    createVendorSchema,
    listVendorsQuerySchema,
    updateVendorSchema,
    vendorParamsSchema,
} from './vendor.schemas'

    const router = Router()
    const controller = new VendorController()

    router.post('/', validate(createVendorSchema), controller.create)

    router.get('/', validate(listVendorsQuerySchema, 'query'), controller.findAll)

    router.get('/:publicId', validate(vendorParamsSchema, 'params'), controller.findOne)

    router.patch(
        '/:publicId',
        validate(vendorParamsSchema, 'params'),
        validate(updateVendorSchema),
        controller.update
    )

    router.delete('/:publicId', validate(vendorParamsSchema, 'params'), controller.remove)

export default router