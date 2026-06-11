import { z } from 'zod'
import {
    closeMonthlyClosingSchema,
    createMonthlyClosingSchema,
    listMonthlyClosingsQuerySchema,
    reopenMonthlyClosingSchema,
} from '../monthly-closing.schemas'

export type CreateMonthlyClosingDto = z.infer<typeof createMonthlyClosingSchema>

export type ListMonthlyClosingsQueryDto = z.infer<typeof listMonthlyClosingsQuerySchema>

export type CloseMonthlyClosingDto = z.infer<typeof closeMonthlyClosingSchema>

export type ReopenMonthlyClosingDto = z.infer<typeof reopenMonthlyClosingSchema>