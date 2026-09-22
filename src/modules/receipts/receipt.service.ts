import { AppDataSource } from "../../bootstrap/database";

import { ApiError } from "../../shared/errors";

import { IncomeService } from "../incomes/income.service";

import { ReceiptRepository } from "./receipt.repository";
import { ReceiptSequenceRepository } from "./receipt-sequence.repository";


export class ReceiptService {
  constructor(
    private readonly repository = new ReceiptRepository(),
    private readonly sequenceRepository = new ReceiptSequenceRepository(),
    private readonly incomeService = new IncomeService(),
  ) {}

  async createForIncome(
    incomePublicId: string,
    companyId: number,
    createdBy?: string,
  ) {
    const income = await this.incomeService.findByPublicId(
      incomePublicId,
      companyId,
    );

    const existing = await this.repository.findByIncomeId(income.id);

    if (existing) {
      return existing;
    }

    try {
      return await AppDataSource.transaction(async (manager) => {
        /*
         * Check again inside the transaction.
         *
         * This protects against concurrent
         * requests attempting to generate a
         * receipt for the same Income.
         */
        const existingInsideTransaction = await this.repository.findByIncomeId(
          income.id,
          manager,
        );

        if (existingInsideTransaction) {
          return existingInsideTransaction;
        }

        const issuedAt = new Date();

        const year = issuedAt.getFullYear();

        const nextNumber = await this.sequenceRepository.getNextNumber(
          companyId,
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
      });
    } catch (error) {
      /*
       * Final race-condition fallback.
       *
       * The database UNIQUE constraint on
       * income_id is still the ultimate
       * protection. If another request won
       * the race, return that Receipt.
       */
      const concurrentReceipt = await this.repository.findByIncomeId(income.id);

      if (concurrentReceipt) {
        return concurrentReceipt;
      }

      throw error;
    }
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
