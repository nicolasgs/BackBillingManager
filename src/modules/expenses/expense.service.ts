import { ApiError } from "../../shared/errors";
import {
  AuditAction,
  AuditEntityType,
  BillingCategoryType,
  RevenueOwnerType,
  RevenueParticipantType,
} from "../../shared/enums";

import { AuditLogService } from "../audit-logs/audit-log.service";
import { AuthContext } from "../audit-logs/interfaces/auth-context.interface";
import { BillingCategoryRepository } from "../billing-categories/billing-category.repository";
import { PeriodLockService } from "../monthly-closings/services/period-lock.service";
import { PaymentMethodTypeRepository } from "../payment-method-type/payment-method-type.repository";
import { RevenueAgreementRepository } from "../revenue-agreements/revenue-agreement.repository";
import { VendorRepository } from "../vendors/vendor.repository";

import {
  CreateExpenseDto,
  UpdateExpenseDto,
} from "./dto/expense.dto";
import { ExpenseEntity } from "./expense.entity";
import { ExpenseRepository } from "./expense.repository";
import { ExpenseFilters } from "./interfaces/expense-filters.interface";

type ResolveExpenseAttributionParams = {
  companyId: number;
  expenseDate: string;
  casePublicId?: string | null;
  attributedToType?: RevenueOwnerType;
  attributedToPublicId?: string | null;
};

export class ExpenseService {
  constructor(
    private readonly expenseRepository =
      new ExpenseRepository(),

    private readonly categoryRepository =
      new BillingCategoryRepository(),

    private readonly paymentMethodRepository =
      new PaymentMethodTypeRepository(),

    private readonly vendorRepository =
      new VendorRepository(),

    private readonly periodLockService =
      new PeriodLockService(),

    private readonly auditLogService =
      new AuditLogService(),

    private readonly revenueAgreementRepository =
      new RevenueAgreementRepository(),
  ) {}

  async create(
    payload: CreateExpenseDto,
    authContext?: AuthContext,
  ) {
    const category =
      await this.categoryRepository
        .findByIdAndCompanyAndType({
          id: payload.categoryId,
          companyId: payload.companyId,
          type: BillingCategoryType.EXPENSE,
        });

    await this.periodLockService
      .validateOpenPeriod(
        payload.companyId,
        payload.expenseDate,
      );

    if (!category) {
      throw new ApiError(
        400,
        "INVALID_EXPENSE_CATEGORY",
        "Invalid expense category",
      );
    }

    const paymentMethod =
      await this.paymentMethodRepository
        .findByCode(
          payload.paymentMethodCode,
        );

    if (!paymentMethod) {
      throw new ApiError(
        400,
        "INVALID_PAYMENT_METHOD",
        "Invalid payment method",
      );
    }

    let vendorName =
      payload.vendorName ?? null;

    let vendorPublicId =
      payload.vendorPublicId ?? null;

    if (payload.vendorId) {
      const vendor =
        await this.vendorRepository
          .findByIdAndCompany({
            id: payload.vendorId,
            companyId: payload.companyId,
          });

      if (!vendor) {
        throw new ApiError(
          400,
          "INVALID_VENDOR",
          "Invalid vendor",
        );
      }

      vendorName = vendor.name;
      vendorPublicId =
        vendor.publicId;
    }

    const attribution =
      await this.resolveExpenseAttribution({
        companyId: payload.companyId,

        expenseDate:
          payload.expenseDate,

        casePublicId:
          payload.casePublicId ?? null,

        attributedToType:
          payload.attributedToType ??
          RevenueOwnerType.TENANT,

        attributedToPublicId:
          payload.attributedToPublicId ??
          null,
      });

    const expenseEntity =
      this.expenseRepository
        .createEntity({
          ...payload,

          vendorName,
          vendorPublicId,

          attributedToType:
            attribution.attributedToType,

          attributedToPublicId:
            attribution.attributedToPublicId,

          attributedToName:
            attribution.attributedToName,

          amount: Number(
            Number(
              payload.amount,
            ).toFixed(2),
          ),
        });

    const expense =
      await this.expenseRepository
        .save(expenseEntity);

    await this.auditLogService.log({
      companyId: expense.companyId,

      companyPublicId:
        expense.companyPublicId,

      entityType:
        AuditEntityType.EXPENSE,

      entityId:
        expense.id,

      entityPublicId:
        expense.publicId,

      action:
        AuditAction.CREATE,

      newValues:
        expense,

      authContext,
    });

    return expense;
  }

  async findAll(
    filters: ExpenseFilters,
  ) {
    return this.expenseRepository
      .findAll(filters);
  }

  async findByPublicId(
    publicId: string,
    companyId: number,
  ) {
    const expense =
      await this.expenseRepository
        .findByPublicId(publicId);

    if (
      !expense ||
      expense.companyId !== companyId
    ) {
      throw new ApiError(
        404,
        "EXPENSE_NOT_FOUND",
        "Expense not found",
      );
    }

    return expense;
  }

  async update(
    publicId: string,
    payload: UpdateExpenseDto,
    companyId: number,
    authContext?: AuthContext,
  ) {
    const expense =
      await this.findByPublicId(
        publicId,
        companyId,
      );

    const originalExpense = {
      ...expense,
    };

    const originalDate =
      expense.expenseDate;

    const transactionDate =
      payload.expenseDate ??
      expense.expenseDate;

    /*
     * Moving an Expense changes both
     * accounting periods.
     */
    await this.periodLockService
      .validateOpenPeriod(
        expense.companyId,
        originalDate,
      );

    if (
      transactionDate !==
      originalDate
    ) {
      await this.periodLockService
        .validateOpenPeriod(
          expense.companyId,
          transactionDate,
        );
    }

    if (
      payload.categoryId !== undefined
    ) {
      const category =
        await this.categoryRepository
          .findByIdAndCompanyAndType({
            id: payload.categoryId,
            companyId:
              expense.companyId,
            type:
              BillingCategoryType.EXPENSE,
          });

      if (!category) {
        throw new ApiError(
          400,
          "INVALID_EXPENSE_CATEGORY",
          "Invalid expense category",
        );
      }
    }

    if (
      payload.paymentMethodCode !==
      undefined
    ) {
      const paymentMethod =
        await this.paymentMethodRepository
          .findByCode(
            payload.paymentMethodCode,
          );

      if (!paymentMethod) {
        throw new ApiError(
          400,
          "INVALID_PAYMENT_METHOD",
          "Invalid payment method",
        );
      }
    }

    const normalizedPayload:
      Partial<ExpenseEntity> = {
        ...payload,
      };

    /*
     * Do not assign amount: undefined during
     * partial PATCH requests.
     */
    if (payload.amount !== undefined) {
      normalizedPayload.amount =
        Number(
          Number(
            payload.amount,
          ).toFixed(2),
        );
    }

    /*
     * If vendorId changes, refresh vendor
     * snapshot fields from the real Vendor.
     */
    if (payload.vendorId !== undefined) {
      const vendor =
        await this.vendorRepository
          .findByIdAndCompany({
            id: payload.vendorId,
            companyId:
              expense.companyId,
          });

      if (!vendor) {
        throw new ApiError(
          400,
          "INVALID_VENDOR",
          "Invalid vendor",
        );
      }

      normalizedPayload.vendorName =
        vendor.name;

      normalizedPayload.vendorPublicId =
        vendor.publicId;
    }

    const targetCasePublicId =
      payload.casePublicId !== undefined
        ? payload.casePublicId
        : expense.casePublicId;

    const targetAttributionType =
      payload.attributedToType !== undefined
        ? payload.attributedToType
        : expense.attributedToType;

    const targetAttributionPublicId =
      payload.attributedToPublicId !==
      undefined
        ? payload.attributedToPublicId
        : expense.attributedToPublicId;

    const attribution =
      await this.resolveExpenseAttribution({
        companyId:
          expense.companyId,

        expenseDate:
          transactionDate,

        casePublicId:
          targetCasePublicId,

        attributedToType:
          targetAttributionType,

        attributedToPublicId:
          targetAttributionPublicId,
      });

    normalizedPayload.attributedToType =
      attribution.attributedToType;

    normalizedPayload.attributedToPublicId =
      attribution.attributedToPublicId;

    normalizedPayload.attributedToName =
      attribution.attributedToName;

    Object.assign(
      expense,
      normalizedPayload,
    );

    const updatedExpense =
      await this.expenseRepository
        .save(expense);

    await this.auditLogService.log({
      companyId:
        updatedExpense.companyId,

      companyPublicId:
        updatedExpense.companyPublicId,

      entityType:
        AuditEntityType.EXPENSE,

      entityId:
        updatedExpense.id,

      entityPublicId:
        updatedExpense.publicId,

      action:
        AuditAction.UPDATE,

      oldValues:
        originalExpense,

      newValues:
        updatedExpense,

      authContext,
    });

    return updatedExpense;
  }

  async softDelete(
    publicId: string,
    companyId: number,
    authContext?: AuthContext,
  ) {
    const expense =
      await this.findByPublicId(
        publicId,
        companyId,
      );

    await this.periodLockService
      .validateOpenPeriod(
        expense.companyId,
        expense.expenseDate,
      );

    await this.expenseRepository
      .softDeleteById(
        expense.id,
      );

    await this.auditLogService.log({
      companyId:
        expense.companyId,

      companyPublicId:
        expense.companyPublicId,

      entityType:
        AuditEntityType.EXPENSE,

      entityId:
        expense.id,

      entityPublicId:
        expense.publicId,

      action:
        AuditAction.DELETE,

      oldValues:
        expense,

      authContext,
    });

    return {
      publicId:
        expense.publicId,

      deleted: true,
    };
  }

  private async resolveExpenseAttribution(
    params: ResolveExpenseAttributionParams,
  ) {
    const attributedToType =
      params.attributedToType ??
      RevenueOwnerType.TENANT;

    /*
     * Tenant attribution deliberately removes
     * participant snapshot fields.
     */
    if (
      attributedToType ===
      RevenueOwnerType.TENANT
    ) {
      return {
        attributedToType:
          RevenueOwnerType.TENANT,

        attributedToPublicId:
          null,

        attributedToName:
          null,
      };
    }

    if (!params.casePublicId) {
      throw new ApiError(
        400,
        "EXPENSE_ATTRIBUTION_CASE_REQUIRED",
        "casePublicId is required when an expense is attributed to an associated attorney or counselor.",
      );
    }

    if (
      !params.attributedToPublicId
    ) {
      throw new ApiError(
        400,
        "EXPENSE_ATTRIBUTION_PARTICIPANT_REQUIRED",
        "attributedToPublicId is required when an expense is attributed to an associated attorney or counselor.",
      );
    }

    const participantType =
      attributedToType ===
      RevenueOwnerType.ASSOCIATED_ATTORNEY
        ? RevenueParticipantType.ASSOCIATED_ATTORNEY
        : RevenueParticipantType.COUNSELOR;

    /*
     * Billing already owns the financial
     * participant snapshot through Revenue
     * Agreements, so the frontend cannot invent
     * participant names.
     */
    const agreements =
      await this.revenueAgreementRepository
        .findAll({
          companyId:
            params.companyId,

          casePublicId:
            params.casePublicId,

          participantType,

          participantPublicId:
            params.attributedToPublicId,
        });

    /*
     * The participant must have an agreement
     * effective on the Expense date.
     */
    const agreement =
      agreements.find(
        (candidate) =>
          candidate.effectiveFrom <=
            params.expenseDate &&
          (
            !candidate.endedAt ||
            candidate.endedAt >=
              params.expenseDate
          ),
      );

    if (!agreement) {
      throw new ApiError(
        400,
        "INVALID_EXPENSE_ATTRIBUTION_PARTICIPANT",
        "The selected participant does not have a revenue agreement for this case that is effective on the expense date.",
      );
    }

    return {
      attributedToType,

      attributedToPublicId:
        agreement.participantPublicId,

      attributedToName:
        agreement.participantName ??
        null,
    };
  }
}