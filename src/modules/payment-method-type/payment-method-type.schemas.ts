import { z } from 'zod'

export const createPaymentMethodTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(
      /^[A-Za-z0-9_]+$/,
      'Code may only contain letters, numbers, and underscores'
    )
    .toUpperCase(),

  description: z.string().trim().min(2).max(100),
})

export const updatePaymentMethodTypeSchema = z
  .object({
    description: z.string().trim().min(2).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const paymentMethodTypeParamsSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(
      /^[A-Za-z0-9_]+$/,
      'Code may only contain letters, numbers, and underscores'
    )
    .toUpperCase(),
})