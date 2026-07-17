import { z } from 'zod'
import { ClosingStatus } from '../../shared/enums'

export const createMonthlyClosingSchema = z.object({
  companyId: z.coerce.number().int().positive(),
  companyPublicId: z.string().uuid().nullable().optional(),

  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),

  notes: z.string().max(1000).nullable().optional(),
  createdBy: z.string().min(1).max(100).optional(),
})

export const listMonthlyClosingsQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  status: z.nativeEnum(ClosingStatus).optional(),
})

export const monthlyClosingParamsSchema = z.object({
  publicId: z.string().uuid(),
})

export const closeMonthlyClosingSchema = z
  .object({})
  .optional()
  .default({})

export const reopenMonthlyClosingSchema = z
  .object({
    notes: z.string().max(1000).nullable().optional(),
  })
  .optional()
  .default({})