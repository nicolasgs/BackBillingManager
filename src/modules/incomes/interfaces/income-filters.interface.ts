import { TransactionStatus } from '../../../shared/enums'

export interface IncomeFilters {
    companyId: string

    clientId?: number
    caseId?: number

    clientPublicId?: string
    casePublicId?: string
    contractPublicId?: string
    invoicePublicId?: string

    categoryId?: number
    paymentMethodCode?: string
    status?: TransactionStatus

    fromDate?: string
    toDate?: string
}