import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { IncomeController } from './income.controller'
import {
    createIncomeSchema,
    incomeParamsSchema,
    listIncomesQuerySchema,
    updateIncomeSchema,
} from './income.schemas'
import { injectAuthContextToBody } from '../../middlewares/inject-auth-context.middleware'

const router = Router()
const controller = new IncomeController()

    router.post(
        '/',
        injectAuthContextToBody,
        validate(createIncomeSchema),
        controller.create
    )

    router.get('/', validate(listIncomesQuerySchema, 'query'), controller.findAll)

    router.get('/:publicId', validate(incomeParamsSchema, 'params'), controller.findOne)

    router.patch(
        '/:publicId',
        validate(incomeParamsSchema, 'params'),
        validate(updateIncomeSchema),
        controller.update
    )

    router.delete('/:publicId', validate(incomeParamsSchema, 'params'), controller.remove)

export default router