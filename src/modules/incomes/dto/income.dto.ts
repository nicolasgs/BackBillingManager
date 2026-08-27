import { z } from 'zod'
import {
    createIncomeSchema,
    listIncomesQuerySchema,
    updateIncomeSchema,
    createCrmPaymentIncomeSchema,
} from '../income.schemas'

export type CreateIncomeDto = z.infer<typeof createIncomeSchema>

export type UpdateIncomeDto = z.infer<typeof updateIncomeSchema>

export type ListIncomesQueryDto = z.infer<typeof listIncomesQuerySchema>

export type CreateCrmPaymentIncomeDto = z.infer<typeof createCrmPaymentIncomeSchema>