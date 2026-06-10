import { z } from 'zod'
import {
    createIncomeSchema,
    listIncomesQuerySchema,
    updateIncomeSchema,
} from '../income.schemas'

export type CreateIncomeDto = z.infer<typeof createIncomeSchema>

export type UpdateIncomeDto = z.infer<typeof updateIncomeSchema>

export type ListIncomesQueryDto = z.infer<typeof listIncomesQuerySchema>