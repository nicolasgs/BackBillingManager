import { z } from 'zod'
import {
    createExpenseSchema,
    listExpensesQuerySchema,
    updateExpenseSchema,
} from '../expense.schemas'

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>

export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>

export type ListExpensesQueryDto = z.infer<typeof listExpensesQuerySchema>