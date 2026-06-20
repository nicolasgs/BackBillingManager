import { z } from 'zod'

export const reportDateRangeQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
  companyPublicId: z.string().uuid().nullable().optional(),

  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})