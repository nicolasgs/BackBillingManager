import { z } from 'zod'
import { BillingCategoryType } from '../../shared/enums'

export const createBillingCategorySchema = z.object({
  companyId: z.coerce.number().int().positive(),
  companyPublicId: z.string().uuid().nullable().optional(),

  name: z.string().min(2).max(120),
  type: z.nativeEnum(BillingCategoryType),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
  createdBy: z.string().min(1).max(100).optional(),
})

export const updateBillingCategorySchema = z.object({
  name: z.string().min(2).max(120).optional(),
  type: z.nativeEnum(BillingCategoryType).optional(),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
})

export const billingCategoryParamsSchema = z.object({
  publicId: z.string().uuid(),
})

export const listBillingCategoriesQuerySchema = z.object({
  type: z.nativeEnum(BillingCategoryType).optional(),
  isActive: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      return value === 'true'
    }),
})