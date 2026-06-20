import { z } from 'zod'
import { reportDateRangeQuerySchema } from '../reports.schemas'

export type ReportDateRangeQueryDto = z.infer<typeof reportDateRangeQuerySchema>