import { z } from 'zod'

export const reportDateRangeQuerySchema = z
  .object({
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .refine(
    (data) =>
      !data.fromDate ||
      !data.toDate ||
      data.fromDate <= data.toDate,
    {
      message: 'fromDate cannot be later than toDate',
      path: ['fromDate'],
    }
  )