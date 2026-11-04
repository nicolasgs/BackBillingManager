import { EntityManager } from "typeorm";

import { AppDataSource } from "../../bootstrap/database";

import { TransactionStatus } from "../../shared/enums";
import { ApiError } from "../../shared/errors";

import { IncomeEntity } from "../incomes/income.entity";
import { IncomeRepository } from "../incomes/income.repository";

import { ReceiptRepository } from "./receipt.repository";
import { ReceiptSequenceRepository } from "./receipt-sequence.repository";


export class ReceiptService {
  constructor(
    private readonly repository = new ReceiptRepository(),
    private readonly sequenceRepository = new ReceiptSequenceRepository(),
    private readonly incomeRepository = new IncomeRepository(),
  ) {}

  async createForIncome(
    incomePublicId: string,
    companyId: number,
    createdBy?: string,
  ) {
    const income = await this.incomeRepository.findByPublicId(incomePublicId);

    if (!income || income.companyId !== companyId) {
      throw new ApiError(404, "INCOME_NOT_FOUND", "Income not found");
    }

    const existing = await this.repository.findByIncomeId(income.id);

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
  ) {
    /*
     * This method intentionally does not open its
     * own transaction. The caller owns the
     * transaction and supplies its EntityManager.
     */
    const existing = await this.repository.findByIncomeId(
      income.id,
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

    return await this.repository.save(receiptEntity, manager);
  }

  async hasReceiptForIncome(
    incomeId: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const receipt =
      await this.repository.findByIncomeId(
        incomeId,
        manager,
      );

    return Boolean(receipt);
  }

  async findByPublicId(publicId: string, companyId: number) {
    const receipt = await this.repository.findByPublicId(publicId);

    if (!receipt || receipt.companyId !== companyId) {
      throw new ApiError(404, "RECEIPT_NOT_FOUND", "Receipt not found");
    }

    return receipt;
  }

  async findByIncomePublicId(incomePublicId: string, companyId: number) {
    const receipt = await this.repository.findByIncomePublicId(incomePublicId);

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
