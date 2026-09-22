import { TransactionStatus } from "../../../shared/enums";

export type IncomeSortBy =
  | "incomeDate"
  | "amount"
  | "clientName"
  | "caseReference"
  | "paymentMethodCode"
  | "createdAt";

export type IncomeSortOrder = "ASC" | "DESC";

export interface IncomeFilters {
  companyId: number;
  companyPublicId?: string;

  clientId?: number;
  caseId?: number;

  clientPublicId?: string;
  casePublicId?: string;

  categoryId?: number;
  paymentMethodCode?: string;
  status?: TransactionStatus;

  fromDate?: string;
  toDate?: string;

  search?: string;

  page?: number;
  limit?: number;

  sortBy?: IncomeSortBy;
  sortOrder?: IncomeSortOrder;
}
