import { BillingCategoryType } from '../../../shared/enums'

export interface BillingCategoryFilters {
    companyId: number
    companyPublicId?: string
    type?: BillingCategoryType
    isActive?: boolean
}