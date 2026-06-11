import { ClosingStatus } from '../../../shared/enums'

export interface MonthlyClosingFilters {
    companyId: number
    year?: number
    month?: number
    status?: ClosingStatus
}