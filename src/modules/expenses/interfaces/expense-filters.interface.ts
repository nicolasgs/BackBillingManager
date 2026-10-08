import {
  RevenueOwnerType,
  TransactionStatus,
} from "../../../shared/enums";

export interface ExpenseFilters {
  companyId: number;

  companyPublicId?: string | null;

  vendorId?: number;

  vendorPublicId?: string | null;

  vendorName?: string;

  caseId?: number;

  casePublicId?: string;

  attributedToType?: RevenueOwnerType;

  attributedToPublicId?: string;

  categoryId?: number;

  paymentMethodCode?: string;

  status?: TransactionStatus;

  fromDate?: string;

  toDate?: string;
}