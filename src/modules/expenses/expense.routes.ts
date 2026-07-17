import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { ExpenseController } from './expense.controller'
import {
    createExpenseSchema,
    expenseParamsSchema,
    listExpensesQuerySchema,
    updateExpenseSchema,
} from './expense.schemas'
import { injectAuthContextToBody } from '../../middlewares/inject-auth-context.middleware'

const router = Router()
const controller = new ExpenseController()

     router.post(
            '/',
            injectAuthContextToBody,
            validate(createExpenseSchema), 
            controller.create)

    router.get('/', validate(listExpensesQuerySchema, 'query'), controller.findAll)

    router.get('/:publicId', validate(expenseParamsSchema, 'params'), controller.findOne)

    router.patch(
        '/:publicId',
        validate(expenseParamsSchema, 'params'),
        validate(updateExpenseSchema),
        controller.update
    )

    router.delete('/:publicId', validate(expenseParamsSchema, 'params'), controller.remove)

export default router