import { z } from 'zod'

export const createPaymentMethodTypeSchema = z.object({
    code: z.string().min(2).max(20).toUpperCase(),
    description: z.string().min(2).max(100),
})

export const updatePaymentMethodTypeSchema = z.object({
    description: z.string().min(2).max(100).optional(),
})

export const paymentMethodTypeParamsSchema = z.object({
    code: z.string().min(2).max(20).toUpperCase(),
})