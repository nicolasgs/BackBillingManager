import { z } from 'zod'
import {
    createVendorSchema,
    listVendorsQuerySchema,
    updateVendorSchema,
} from '../vendor.schemas'

export type CreateVendorDto = z.infer<typeof createVendorSchema>

export type UpdateVendorDto = z.infer<typeof updateVendorSchema>

export type ListVendorsQueryDto = z.infer<typeof listVendorsQuerySchema>