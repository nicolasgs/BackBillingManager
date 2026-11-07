import { EntityManager } from "typeorm";

import { AppDataSource } from "../../bootstrap/database";

import {
  AuditAction,
  AuditEntityType,
  TransactionStatus,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";

import { AuditLogService } from "../audit-logs/audit-log.service";
import { AuthContext } from "../audit-logs/interfaces/auth-context.interface";

import { IncomeEntity } from "../incomes/income.entity";
import { IncomeRepository } from "../incomes/income.repository";

import { ReceiptRepository } from "./receipt.repository";
import { ReceiptSequenceRepository } from "./receipt-sequence.repository";


export class ReceiptService {
  constructor(
    private readonly repository = new ReceiptRepository(),
    private readonly sequenceRepository = new ReceiptSequenceRepository(),
    private readonly incomeRepository = new IncomeRepository(),
    private readonly auditLogService = new AuditLogService(),
  ) {}

  async createForIncome(
    incomePublicId: string,
    companyId: number,
    createdBy?: string,
    authContext?: AuthContext,
  ) {
    const income =
      await this.incomeRepository
        .findByPublicId(
          incomePublicId,
          companyId,
        );

    if (!income || income.companyId !== companyId) {
      throw new ApiError(404, "INCOME_NOT_FOUND", "Income not found");
    }

    const existing = await this.repository.findByIncomeId(
      income.id,
      companyId,
    );

    if (existing) {
      return existing;
    }

    try {
      return await AppDataSource.transaction(
        async (manager) => {
          /*
           * Serialize Receipt issuance with Income
           * update/delete operations. Build the
           * immutable Receipt snapshot from the
           * locked, current Income state.
           */
          const lockedIncome =
            await this.incomeRepository
              .findByPublicIdForUpdate(
                incomePublicId,
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

          return this.createForIncomeInTransaction(
            lockedIncome,
            createdBy,
            manager,
            authContext,
          );
        },
      );
    } catch (error: any) {
      /*
       * Final race-condition fallback.
       *
       * Recover only the expected concurrent
       * duplicate Receipt for this Income.
       * Unrelated database errors must propagate.
       */
      if (
        error?.code === "23505" &&
        error?.constraint ===
          "uq_receipts_income_id"
      ) {
        const concurrentReceipt =
          await this.repository.findByIncomeId(
            income.id,
            companyId,
          );

        if (concurrentReceipt) {
          return concurrentReceipt;
        }
      }

      throw error;
    }
  }

  async createForIncomeInTransaction(
    income: IncomeEntity,
    createdBy: string | undefined,
    manager: EntityManager,
    authContext?: AuthContext,
  ) {
    /*
     * This method intentionally does not open its
     * own transaction. The caller owns the
     * transaction and supplies its EntityManager.
     */
    const existing = await this.repository.findByIncomeId(
      income.id,
      income.companyId,
      manager,
    );

    if (existing) {
      return existing;
    }

    if (
      income.status !==
      TransactionStatus.PAID
    ) {
      throw new ApiError(
        409,
        "RECEIPT_REQUIRES_PAID_INCOME",
        "A receipt can only be issued for a paid income.",
      );
    }

    const issuedAt = new Date();

    const year = issuedAt.getFullYear();

    const nextNumber = await this.sequenceRepository.getNextNumber(
      income.companyId,
      year,
      manager,
    );

    const receiptNumber = this.buildReceiptNumber(year, nextNumber);

    const receiptEntity = this.repository.createEntity(
      {
        receiptNumber,

        incomeId: income.id,

        incomePublicId: income.publicId,

        companyId: income.companyId,

        companyPublicId: income.companyPublicId ?? null,

        amount: Number(Number(income.amount).toFixed(2)),

        currency: income.currency,

        paymentDate: income.incomeDate,

        description: income.description ?? null,

        paymentMethodCode: income.paymentMethodCode,

        referenceNumber: income.referenceNumber ?? null,

        clientName: income.clientName ?? null,

        caseReference: income.caseReference ?? null,

        issuedAt,

        createdBy: createdBy ?? null,

        fileStorageProvider: null,

        fileBucket: null,

        fileKey: null,

        fileName: null,

        fileMimeType: null,

        fileSize: null,

        fileChecksum: null,

        generatedAt: null,
      },
      manager,
    );

    const savedReceipt =
      await this.repository.save(
        receiptEntity,
        manager,
      );

    await this.auditLogService.log(
      {
        companyId: savedReceipt.companyId,
        companyPublicId:
          savedReceipt.companyPublicId ?? null,

        entityType: AuditEntityType.RECEIPT,

        entityId: savedReceipt.id,

        entityPublicId:
          savedReceipt.publicId,

        action: AuditAction.CREATE,

        oldValues: null,

        newValues: {
          id: savedReceipt.id,
          publicId:
            savedReceipt.publicId,

          receiptNumber:
            savedReceipt.receiptNumber,

          incomeId:
            savedReceipt.incomeId,

          incomePublicId:
            savedReceipt.incomePublicId,

          amount:
            Number(savedReceipt.amount),

          currency:
            savedReceipt.currency,

          paymentDate:
            savedReceipt.paymentDate,

          paymentMethodCode:
            savedReceipt.paymentMethodCode ??
            null,

          referenceNumber:
            savedReceipt.referenceNumber ??
            null,

          issuedAt:
            savedReceipt.issuedAt,
        },

        authContext,
      },
      manager,
    );

    return savedReceipt;
  }

  async hasReceiptForIncome(
    incomeId: number,
    companyId: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const receipt =
      await this.repository.findByIncomeId(
        incomeId,
        companyId,
        manager,
      );

    return Boolean(receipt);
  }

  async findByPublicId(publicId: string, companyId: number) {
    const receipt =
      await this.repository.findByPublicId(
        publicId,
        companyId,
      );

    if (!receipt || receipt.companyId !== companyId) {
      throw new ApiError(404, "RECEIPT_NOT_FOUND", "Receipt not found");
    }

    return receipt;
  }

  async findByIncomePublicId(incomePublicId: string, companyId: number) {
    const receipt =
      await this.repository.findByIncomePublicId(
        incomePublicId,
        companyId,
      );

    if (!receipt || receipt.companyId !== companyId) {
      throw new ApiError(
        404,
        "RECEIPT_NOT_FOUND",
        "Receipt not found for this income",
      );
    }

    return receipt;
  }

  private buildReceiptNumber(year: number, sequence: number): string {
    return ["RCP", year, String(sequence).padStart(6, "0")].join("-");
  }
}
