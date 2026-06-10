import { z } from 'zod'
import {
    createBillingCategorySchema,
    listBillingCategoriesQuerySchema,
    updateBillingCategorySchema,
} from '../billing-category.schemas'

export type CreateBillingCategoryDto = z.infer<typeof createBillingCategorySchema>

export type UpdateBillingCategoryDto = z.infer<typeof updateBillingCategorySchema>

export type ListBillingCategoriesQueryDto = z.infer<typeof listBillingCategoriesQuerySchema>