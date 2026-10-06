import { AppDataSource } from "../../bootstrap/database";
import {
  AuditAction,
  AuditEntityType,
  BillingCategoryType,
  TransactionSource,
  TransactionStatus,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";
import { AuditLogService } from "../audit-logs/audit-log.service";
import { AuthContext } from "../audit-logs/interfaces/auth-context.interface";
import { BillingCategoryRepository } from "../billing-categories/billing-category.repository";
import { BillingSettingsService } from "../billing-settings/billing-settings.service";
import { IncomeAllocationService } from "../income-allocations/income-allocation.service";
import { PeriodLockService } from "../monthly-closings/services/period-lock.service";
import { PaymentMethodTypeRepository } from "../payment-method-type/payment-method-type.repository";

import {
  CreateCrmPaymentIncomeDto,
  CreateIncomeDto,
  UpdateIncomeDto,
} from "./dto/income.dto";
import { IncomeEntity } from "./income.entity";
import { IncomeRepository } from "./income.repository";
import { IncomeFilters } from "./interfaces/income-filters.interface";

export class IncomeService {
  constructor(
    private readonly incomeRepository =
      new IncomeRepository(),

    private readonly categoryRepository =
      new BillingCategoryRepository(),

    private readonly paymentMethodRepository =
      new PaymentMethodTypeRepository(),

    private readonly periodLockService =
      new PeriodLockService(),

    private readonly auditLogService =
      new AuditLogService(),

    private readonly billingSettingsService =
      new BillingSettingsService(),

    private readonly incomeAllocationService =
      new IncomeAllocationService(),
  ) {}

  async create(
    payload: CreateIncomeDto,
    authContext?: AuthContext,
  ) {
    const category =
      await this.categoryRepository
        .findByIdAndCompanyAndType({
          id: payload.categoryId,
          companyId: payload.companyId,
          type: BillingCategoryType.INCOME,
        });

    await this.periodLockService
      .validateOpenPeriod(
        payload.companyId,
        payload.incomeDate,
      );

    if (!category) {
      throw new ApiError(
        400,
        "INVALID_INCOME_CATEGORY",
        "Invalid income category",
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

    /*
     * Income + automatic allocation are one
     * accounting transaction.
     *
     * If allocation fails, Income creation
     * rolls back as well.
     */
    const income =
      await AppDataSource.transaction(
        async (manager) => {
          const incomeEntity =
            this.incomeRepository
              .createEntity(
                {
                  ...payload,

                  amount: Number(
                    Number(
                      payload.amount,
                    ).toFixed(2),
                  ),
                },
                manager,
              );

          const savedIncome =
            await this.incomeRepository.save(
              incomeEntity,
              manager,
            );

          if (
            savedIncome.status ===
            TransactionStatus.PAID
          ) {
            await this.incomeAllocationService
              .allocatePaidIncome(
                savedIncome,
                payload.createdBy ??
                  authContext?.userId,
                manager,
              );
          }

          return savedIncome;
        },
      );

    await this.auditLogService.log({
      companyId: income.companyId,
      companyPublicId:
        income.companyPublicId,

      entityType: AuditEntityType.INCOME,
      entityId: income.id,
      entityPublicId: income.publicId,

      action: AuditAction.CREATE,

      newValues: income,

      authContext,
    });

    return income;
  }

  async createFromCrmPayment(
    payload: CreateCrmPaymentIncomeDto & {
      companyId: number;
      companyPublicId?: string | null;
      createdBy?: string;
    },

    authContext?: AuthContext,
  ) {
    const externalProvider =
      "MINDPRO_CRM";

    const externalTransactionId =
      `PAYMENT:${payload.paymentId}`;

    /*
     * CRM retry idempotency.
     */
    const existing =
      await this.incomeRepository
        .findByExternalReference({
          companyId: payload.companyId,
          externalProvider,
          externalTransactionId,
        });

    if (existing) {
      return existing;
    }

    const settings =
      await this.billingSettingsService
        .findByCompany(
          payload.companyId,
        );

    if (!settings) {
      throw new ApiError(
        400,
        "BILLING_SETTINGS_NOT_CONFIGURED",
        "Billing settings have not been configured for this company.",
      );
    }

    const categoryId =
      settings.crmPaymentIncomeCategoryId;

    if (!categoryId) {
      throw new ApiError(
        400,
        "CRM_PAYMENT_INCOME_CATEGORY_NOT_CONFIGURED",
        "The default income category for CRM payments has not been configured.",
      );
    }

    /*
     * CRM payments delegate to create().
     *
     * Because CRM payments are PAID,
     * create() automatically generates
     * revenue allocations in the same
     * database transaction.
     */
    return this.create(
      {
        companyId: payload.companyId,

        companyPublicId:
          payload.companyPublicId ??
          null,

        createdBy:
          payload.createdBy,

        clientId: payload.clientId,

        caseId: payload.caseId,

        casePublicId:
          payload.casePublicId,

        clientName:
          payload.clientName ?? null,

        caseReference:
          payload.caseReference ?? null,

        amount: payload.amount,

        currency: "USD",

        incomeDate:
          payload.paymentDate,

        categoryId,

        paymentMethodCode:
          payload.paymentMethodCode,

        description:
          payload.notes
            ? `CRM payment #${payload.paymentId}: ${payload.notes}`
            : `CRM payment #${payload.paymentId}`,

        referenceNumber:
          payload.referenceNumber ??
          undefined,

        status:
          TransactionStatus.PAID,

        source:
          TransactionSource.OTHER,

        externalProvider,

        externalTransactionId,
      },

      authContext,
    );
  }

  async findAll(
    filters: IncomeFilters,
  ) {
    return this.incomeRepository
      .findAll(filters);
  }

  async findByPublicId(
    publicId: string,
    companyId: number,
  ) {
    const income =
      await this.incomeRepository
        .findByPublicId(publicId);

    if (
      !income ||
      income.companyId !== companyId
    ) {
      throw new ApiError(
        404,
        "INCOME_NOT_FOUND",
        "Income not found",
      );
    }

    return income;
  }

  async update(
    publicId: string,
    payload: UpdateIncomeDto,
    companyId: number,
    authContext?: AuthContext,
  ) {
    const transactionResult =
      await AppDataSource.transaction(
        async (manager) => {
          /*
           * Lock the Income so two concurrent
           * updates cannot both trigger
           * allocation.
           */
          const income =
            await this.incomeRepository
              .findByPublicIdForUpdate(
                publicId,
                companyId,
                manager,
              );

          if (!income) {
            throw new ApiError(
              404,
              "INCOME_NOT_FOUND",
              "Income not found",
            );
          }

          const originalIncome = {
            ...income,
          };

          const originalDate =
            income.incomeDate;

          const transactionDate =
            payload.incomeDate ??
            income.incomeDate;

          /*
           * Changing the date modifies both
           * accounting periods:
           *
           * - the old period loses a transaction
           * - the new period gains one
           */
          await this.periodLockService
            .validateOpenPeriod(
              income.companyId,
              originalDate,
            );

          if (
            transactionDate !==
            originalDate
          ) {
            await this.periodLockService
              .validateOpenPeriod(
                income.companyId,
                transactionDate,
              );
          }

          const hasAllocations =
            await this.incomeAllocationService
              .hasAllocations(
                Number(income.id),
                manager,
              );

          const normalizedPayload: UpdateIncomeDto = {
            ...payload,
          };

          if (payload.amount !== undefined) {
            normalizedPayload.amount = Number(
              Number(payload.amount).toFixed(2),
            );
          }

          if (hasAllocations) {
            this.assertAllocatedIncomeMutationAllowed(
              income,
              normalizedPayload,
            );
          }

          const previousStatus =
            income.status;

          Object.assign(
            income,
            normalizedPayload,
          );

          const updatedIncome =
            await this.incomeRepository
              .save(
                income,
                manager,
              );

          /*
           * Only a genuine transition into PAID
           * creates allocations here.
           *
           * Existing legacy PAID records without
           * allocations are intentionally NOT
           * backfilled merely because someone
           * edits their description/reference.
           */
          const becamePaid =
            previousStatus !==
              TransactionStatus.PAID &&
            updatedIncome.status ===
              TransactionStatus.PAID;

          if (becamePaid) {
            await this.incomeAllocationService
              .allocatePaidIncome(
                updatedIncome,
                authContext?.userId ??
                  updatedIncome.createdBy,
                manager,
              );
          }

          return {
            originalIncome,
            updatedIncome,
          };
        },
      );

    await this.auditLogService.log({
      companyId:
        transactionResult
          .updatedIncome
          .companyId,

      companyPublicId:
        transactionResult
          .updatedIncome
          .companyPublicId,

      entityType:
        AuditEntityType.INCOME,

      entityId:
        transactionResult
          .updatedIncome
          .id,

      entityPublicId:
        transactionResult
          .updatedIncome
          .publicId,

      action:
        AuditAction.UPDATE,

      oldValues:
        transactionResult
          .originalIncome,

      newValues:
        transactionResult
          .updatedIncome,

      authContext,
    });

    return transactionResult
      .updatedIncome;
  }

  async softDelete(
    publicId: string,
    companyId: number,
    authContext?: AuthContext,
  ) {
    const income =
      await AppDataSource.transaction(
        async (manager) => {
          const lockedIncome =
            await this.incomeRepository
              .findByPublicIdForUpdate(
                publicId,
                companyId,
                manager,
              );

          if (!lockedIncome) {
            throw new ApiError(
              404,
              "INCOME_NOT_FOUND",
              "Income not found",
            );
          }

          await this.periodLockService
            .validateOpenPeriod(
              lockedIncome.companyId,
              lockedIncome.incomeDate,
            );

          const hasAllocations =
            await this.incomeAllocationService
              .hasAllocations(
                Number(
                  lockedIncome.id,
                ),
                manager,
              );

          if (hasAllocations) {
            throw new ApiError(
              409,
              "ALLOCATED_INCOME_CANNOT_BE_DELETED",
              "A paid income with revenue allocations cannot be deleted. Use a dedicated reversal workflow instead.",
            );
          }

          await this.incomeRepository
            .softDeleteById(
              Number(
                lockedIncome.id,
              ),
              manager,
            );

          return lockedIncome;
        },
      );

    await this.auditLogService.log({
      companyId: income.companyId,
      companyPublicId:
        income.companyPublicId,

      entityType:
        AuditEntityType.INCOME,

      entityId: income.id,
      entityPublicId:
        income.publicId,

      action:
        AuditAction.DELETE,

      oldValues: income,

      authContext,
    });

    return {
      publicId: income.publicId,
      deleted: true,
    };
  }

  /*
   * Once an Income has allocations, the
   * accounting facts used to calculate those
   * allocations become immutable.
   *
   * Descriptive/non-financial fields may still
   * be edited.
   */
  private assertAllocatedIncomeMutationAllowed(
    income: IncomeEntity,
    payload: UpdateIncomeDto,
  ) {
    const amountChanged =
      payload.amount !== undefined &&
      Number(payload.amount) !==
        Number(income.amount);

    const currencyChanged =
      payload.currency !== undefined &&
      payload.currency !==
        income.currency;

    const dateChanged =
      payload.incomeDate !== undefined &&
      payload.incomeDate !==
        income.incomeDate;

    const caseIdChanged =
      payload.caseId !== undefined &&
      Number(payload.caseId) !==
        Number(income.caseId);

    const casePublicIdChanged =
      payload.casePublicId !==
        undefined &&
      payload.casePublicId !==
        income.casePublicId;

    const statusChanged =
      payload.status !== undefined &&
      payload.status !==
        income.status;

    const sourceChanged =
      payload.source !== undefined &&
      payload.source !==
        income.source;

    const providerChanged =
      payload.externalProvider !==
        undefined &&
      payload.externalProvider !==
        income.externalProvider;

    const transactionIdChanged =
      payload.externalTransactionId !==
        undefined &&
      payload.externalTransactionId !==
        income.externalTransactionId;

    if (
      amountChanged ||
      currencyChanged ||
      dateChanged ||
      caseIdChanged ||
      casePublicIdChanged ||
      statusChanged ||
      sourceChanged ||
      providerChanged ||
      transactionIdChanged
    ) {
      throw new ApiError(
        409,
        "ALLOCATED_INCOME_FINANCIAL_FIELDS_IMMUTABLE",
        "Financial fields of an income with revenue allocations cannot be changed. Use a dedicated reversal/reallocation workflow instead.",
      );
    }
  }
}