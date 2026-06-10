import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { PaymentMethodTypeController } from './payment-method-type.controller'
import {
    createPaymentMethodTypeSchema,
    paymentMethodTypeParamsSchema,
    updatePaymentMethodTypeSchema,
} from './payment-method-type.schemas'

const router = Router()
const controller = new PaymentMethodTypeController()

    router.post('/', validate(createPaymentMethodTypeSchema), controller.create)

    router.get('/', controller.findAll)

    router.get(
        '/:code',
        validate(paymentMethodTypeParamsSchema, 'params'),
        controller.findOne
    )

    router.patch(
        '/:code',
        validate(paymentMethodTypeParamsSchema, 'params'),
        validate(updatePaymentMethodTypeSchema),
    controller.update
    )

    router.delete(
        '/:code',
        validate(paymentMethodTypeParamsSchema, 'params'),
        controller.remove
        )

export default router