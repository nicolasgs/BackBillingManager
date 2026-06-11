import { z } from 'zod'

export const createMonthlyClosingSchema = z.object({
    companyId: z.coerce.number().int().positive(),
    companyPublicId: z.string().uuid().nullable().optional(),

    year: z.coerce.number().int().min(2000).max(2100),
    month: z.coerce.number().int().min(1).max(12),

    notes: z.string().max(1000).nullable().optional(),
    createdBy: z.string().uuid().optional(),
})

export const listMonthlyClosingsQuerySchema = z.object({
    companyId: z.coerce.number().int().positive(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    status: z.string().optional(),
})

export const monthlyClosingParamsSchema = z.object({
    publicId: z.string().uuid(),
})

export const closeMonthlyClosingSchema = z.object({
    closedBy: z.string().uuid(),
})

export const reopenMonthlyClosingSchema = z
    .object({
        notes: z.string().max(1000).nullable().optional(),
    })
    .optional()
    .default({})