import type { EntityManager } from "typeorm";

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
import { ReceiptService } from "../receipts/receipt.service";

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

    private readonly receiptService =
      new ReceiptService(),
  ) {}

  private async validateCreatePayload(
    payload: CreateIncomeDto,
    manager: EntityManager,
  ) {
    await this.periodLockService
      .validateOpenPeriod(
        payload.companyId,
        payload.incomeDate,
        manager,
      );

    const category =
      await this.categoryRepository
        .findActiveByIdAndCompanyAndTypeForUpdate(
          {
            id: payload.categoryId,
            companyId: payload.companyId,
            type: BillingCategoryType.INCOME,
          },
          manager,
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
  }

  private async createInTransaction(
    payload: CreateIncomeDto,
    authContext: AuthContext | undefined,
    manager: EntityManager,
  ) {
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

    await this.auditLogService.log(
      {
        companyId: savedIncome.companyId,
        companyPublicId:
          savedIncome.companyPublicId,

        entityType:
          AuditEntityType.INCOME,

        entityId: savedIncome.id,
        entityPublicId:
          savedIncome.publicId,

        action:
          AuditAction.CREATE,

        newValues: savedIncome,

        authContext,
      },
      manager,
    );

    return savedIncome;
  }

  async create(
    payload: CreateIncomeDto,
    authContext?: AuthContext,
  ) {
    /*
     * Period lock, validation, Income and automatic
     * allocation are one accounting transaction.
     *
     * A concurrent monthly close therefore cannot
     * commit between period validation and creation.
     */
    const income =
      await AppDataSource.transaction(
        async (manager) => {
          await this.validateCreatePayload(
            payload,
            manager,
          );

          return this.createInTransaction(
            payload,
            authContext,
            manager,
          );
        },
      );


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

    const createdBy =
      payload.createdBy ??
      authContext?.userId ??
      undefined;

    /*
     * Fast idempotency path.
     *
     * Existing CRM Incomes may predate atomic
     * Receipt creation, so make sure the Receipt
     * exists before returning the Income.
     */
    const existing =
      await this.incomeRepository
        .findByExternalReference({
          companyId: payload.companyId,
          externalProvider,
          externalTransactionId,
        });

    if (existing) {
      await this.receiptService
        .createForIncome(
          existing.publicId,
          payload.companyId,
          createdBy,
          authContext,
        );

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

    const incomePayload: CreateIncomeDto = {
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
    };


    let transactionResult: {
      income: IncomeEntity;
      created: boolean;
    };

    try {
      transactionResult =
        await AppDataSource.transaction(
          async (manager) => {
            /*
             * Re-check idempotency inside the
             * transaction in case another request
             * committed after the fast-path check.
             */
            const existingInsideTransaction =
              await this.incomeRepository
                .findByExternalReference(
                  {
                    companyId:
                      payload.companyId,
                    externalProvider,
                    externalTransactionId,
                  },
                  manager,
                );

            if (existingInsideTransaction) {
              return {
                income:
                  existingInsideTransaction,
                created: false,
              };
            }

            /*
             * Another CRM retry may have created the
             * Income while this transaction was waiting
             * for the accounting-period lock.
             *
             * Re-check after the lock so an idempotent
             * retry can return the existing Income even
             * if the period was closed immediately after
             * the original creation committed.
             */
            await this.periodLockService
              .lockTransactionPeriod(
                incomePayload.companyId,
                incomePayload.incomeDate,
                manager,
              );

            const existingAfterPeriodLock =
              await this.incomeRepository
                .findByExternalReference(
                  {
                    companyId:
                      payload.companyId,
                    externalProvider,
                    externalTransactionId,
                  },
                  manager,
                );

            if (existingAfterPeriodLock) {
              return {
                income:
                  existingAfterPeriodLock,
                created: false,
              };
            }

            await this.validateCreatePayload(
              incomePayload,
              manager,
            );

            const createdIncome =
              await this.createInTransaction(
                incomePayload,
                authContext,
                manager,
              );

            /*
             * Income, allocations, Receipt and
             * receipt sequence now commit or roll
             * back together.
             */
            await this.receiptService
              .createForIncomeInTransaction(
                createdIncome,
                createdBy,
                manager,
                authContext,
              );

            return {
              income: createdIncome,
              created: true,
            };
          },
        );
    } catch (error: any) {
      /*
       * The database unique index remains the
       * final idempotency guard for concurrent
       * CRM retries.
       */
      if (error?.code === "23505") {
        const concurrentExisting =
          await this.incomeRepository
            .findByExternalReference({
              companyId:
                payload.companyId,
              externalProvider,
              externalTransactionId,
            });

        if (concurrentExisting) {
          await this.receiptService
            .createForIncome(
              concurrentExisting.publicId,
              payload.companyId,
              createdBy,
              authContext,
            );

          return concurrentExisting;
        }
      }

      throw error;
    }

    /*
     * Existing CRM retries must issue/verify the
     * Receipt only after the retry transaction has
     * released any accounting-period lock.
     *
     * createForIncome() then serializes Receipt
     * issuance with Income update/delete by locking
     * the current Income row.
     */
    if (!transactionResult.created) {
      await this.receiptService
        .createForIncome(
          transactionResult.income.publicId,
          payload.companyId,
          createdBy,
          authContext,
        );
    }


    return transactionResult.income;
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
        .findByPublicId(
          publicId,
          companyId,
        );

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
            .validateOpenPeriods(
              income.companyId,
              [
                originalDate,
                transactionDate,
              ],
              manager,
            );

          if (payload.categoryId !== undefined) {
            const categoryChanged =
              Number(payload.categoryId) !==
              Number(income.categoryId);

            const category = categoryChanged
              ? await this.categoryRepository
                  .findActiveByIdAndCompanyAndTypeForUpdate(
                    {
                      id: payload.categoryId,
                      companyId: income.companyId,
                      type: BillingCategoryType.INCOME,
                    },
                    manager,
                  )
              : await this.categoryRepository
                  .findByIdAndCompanyAndTypeForUpdate(
                    {
                      id: payload.categoryId,
                      companyId: income.companyId,
                      type: BillingCategoryType.INCOME,
                    },
                    manager,
                  );

            if (!category) {
              throw new ApiError(
                400,
                "INVALID_INCOME_CATEGORY",
                "Invalid income category",
              );
            }
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

          const hasReceipt =
            await this.receiptService
              .hasReceiptForIncome(
                Number(income.id),
                income.companyId,
                manager,
              );

          if (hasReceipt) {
            this.assertReceiptedIncomeMutationAllowed(
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

          await this.auditLogService.log(
            {
              companyId:
                updatedIncome.companyId,

              companyPublicId:
                updatedIncome.companyPublicId,

              entityType:
                AuditEntityType.INCOME,

              entityId:
                updatedIncome.id,

              entityPublicId:
                updatedIncome.publicId,

              action:
                AuditAction.UPDATE,

              oldValues:
                originalIncome,

              newValues:
                updatedIncome,

              authContext,
            },
            manager,
          );

          return {
            originalIncome,
            updatedIncome,
          };
        },
      );


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
              manager,
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

          const hasReceipt =
            await this.receiptService
              .hasReceiptForIncome(
                Number(lockedIncome.id),
                lockedIncome.companyId,
                manager,
              );

          if (hasReceipt) {
            throw new ApiError(
              409,
              "RECEIPTED_INCOME_CANNOT_BE_DELETED",
              "An income with an issued receipt cannot be deleted. Use a dedicated reversal workflow instead.",
            );
          }

          await this.incomeRepository
            .softDeleteById(
              Number(
                lockedIncome.id,
              ),
              manager,
            );

          await this.auditLogService.log(
            {
              companyId:
                lockedIncome.companyId,

              companyPublicId:
                lockedIncome.companyPublicId,

              entityType:
                AuditEntityType.INCOME,

              entityId:
                lockedIncome.id,

              entityPublicId:
                lockedIncome.publicId,

              action:
                AuditAction.DELETE,

              oldValues:
                lockedIncome,

              authContext,
            },
            manager,
          );

          return lockedIncome;
        },
      );

    return {
      publicId: income.publicId,
      deleted: true,
    };
  }

  /*
   * Preserve the immutable Receipt snapshot and
   * the identity/provenance of the receipted Income.
   * Internal classifications not represented by
   * the Receipt may still be edited.
   */
  private assertReceiptedIncomeMutationAllowed(
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

    const paymentMethodChanged =
      payload.paymentMethodCode !==
        undefined &&
      payload.paymentMethodCode !==
        income.paymentMethodCode;

    const categoryChanged =
      payload.categoryId !== undefined &&
      Number(payload.categoryId) !==
        Number(income.categoryId);

    const descriptionChanged =
      payload.description !== undefined &&
      payload.description !==
        income.description;

    const referenceChanged =
      payload.referenceNumber !==
        undefined &&
      payload.referenceNumber !==
        income.referenceNumber;

    const clientNameChanged =
      payload.clientName !== undefined &&
      payload.clientName !==
        income.clientName;

    const caseReferenceChanged =
      payload.caseReference !==
        undefined &&
      payload.caseReference !==
        income.caseReference;


    const clientIdChanged =
      payload.clientId !== undefined &&
      Number(payload.clientId) !==
        Number(income.clientId);

    const clientPublicIdChanged =
      payload.clientPublicId !==
        undefined &&
      payload.clientPublicId !==
        income.clientPublicId;

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
      paymentMethodChanged ||
      categoryChanged ||
      descriptionChanged ||
      referenceChanged ||
      clientNameChanged ||
      caseReferenceChanged ||
      clientIdChanged ||
      clientPublicIdChanged ||
      caseIdChanged ||
      casePublicIdChanged ||
      statusChanged ||
      sourceChanged ||
      providerChanged ||
      transactionIdChanged
    ) {
      throw new ApiError(
        409,
        "RECEIPTED_INCOME_SNAPSHOT_IMMUTABLE",
        "Receipt-protected income fields and transaction identity cannot be changed.",
      );
    }
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

    const categoryChanged =
      payload.categoryId !== undefined &&
      Number(payload.categoryId) !==
        Number(income.categoryId);

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
      categoryChanged ||
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