import { TransactionStatus } from '../../../shared/enums'

export interface IncomeFilters {
  companyId: number
  companyPublicId?: string

  clientId?: number
  caseId?: number

  clientPublicId?: string
  casePublicId?: string

  categoryId?: number
  paymentMethodCode?: string
  status?: TransactionStatus

  fromDate?: string
  toDate?: string
}