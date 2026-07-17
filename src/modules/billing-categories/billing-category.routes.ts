import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { BillingCategoryController } from './billing-category.controller'
import {
    billingCategoryParamsSchema,
    createBillingCategorySchema,
    listBillingCategoriesQuerySchema,
    updateBillingCategorySchema,
} from './billing-category.schemas'
import { injectAuthContextToBody } from '../../middlewares/inject-auth-context.middleware'

const router = Router()
const controller = new BillingCategoryController()

    router.post(
        '/',
        injectAuthContextToBody,
        validate(createBillingCategorySchema),
        controller.create
    )

    router.get(
        '/',
        validate(listBillingCategoriesQuerySchema, 'query'),
        controller.findAll
    )

    router.get(
        '/:publicId',
        validate(billingCategoryParamsSchema, 'params'),
        controller.findOne
    )

    router.patch(
        '/:publicId',
        validate(billingCategoryParamsSchema, 'params'),
        validate(updateBillingCategorySchema),
        controller.update
    )

    router.delete(
        '/:publicId',
        validate(billingCategoryParamsSchema, 'params'),
        controller.remove
    )

export default router