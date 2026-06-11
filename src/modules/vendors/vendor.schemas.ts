import { z } from 'zod'

export const createVendorSchema = z.object({
    companyId: z.coerce.number().int().positive(),
    companyPublicId: z.string().uuid().nullable().optional(),

    name: z.string().min(2).max(150),
    email: z.string().email().nullable().optional(),
    phone: z.string().max(30).nullable().optional(),
    website: z.string().max(150).nullable().optional(),
    taxId: z.string().max(50).nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),

    isActive: z.boolean().optional(),
    createdBy: z.string().uuid().optional(),
    })

export const updateVendorSchema = createVendorSchema.partial().omit({
    companyId: true,
    createdBy: true,
})

export const vendorParamsSchema = z.object({
    publicId: z.string().uuid(),
})

export const listVendorsQuerySchema = z.object({
    companyId: z.coerce.number().int().positive(),
    companyPublicId: z.string().uuid().nullable().optional(),
    search: z.string().max(150).optional(),
    isActive: z
        .string()
        .optional()
        .transform((value) => {
        if (value === undefined) return undefined
        return value === 'true'
        }),
})