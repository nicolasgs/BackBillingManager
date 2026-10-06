import { EntityManager } from "typeorm";

import {
  CompensationType,
  RevenueOwnerType,
  RevenueParticipantType,
  TransactionStatus,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";
import { IncomeEntity } from "../incomes/income.entity";
import { RevenueAgreementEntity } from "../revenue-agreements/revenue-agreement.entity";
import { RevenueAgreementRepository } from "../revenue-agreements/revenue-agreement.repository";
import { IncomeAllocationEntity } from "./income-allocation.entity";
import { IncomeAllocationRepository } from "./income-allocation.repository";

type PercentageWorkingRow = {
  agreement: RevenueAgreementEntity;
  cents: number;
  fraction: number;
};

export class IncomeAllocationService {
  constructor(
    private readonly allocationRepository =
      new IncomeAllocationRepository(),
    private readonly revenueAgreementRepository =
      new RevenueAgreementRepository(),
  ) {}

  async hasAllocations(
    incomeId: number,
    manager: EntityManager,
  ) {
    return this.allocationRepository.hasAllocations(
      incomeId,
      manager,
    );
  }

  async allocatePaidIncome(
    income: IncomeEntity,
    createdBy: string | null | undefined,
    manager: EntityManager,
  ): Promise<IncomeAllocationEntity[]> {
    if (income.status !== TransactionStatus.PAID) {
      return [];
    }

    /*
     * Idempotency at application level.
     *
     * Database unique indexes remain the final
     * concurrency protection.
     */
    const existing =
      await this.allocationRepository.findByIncomeId(
        Number(income.id),
        manager,
      );

    if (existing.length > 0) {
      return existing;
    }

    const grossCents = this.toCents(income.amount);

    if (grossCents <= 0) {
      throw new ApiError(
        500,
        "INVALID_INCOME_ALLOCATION_AMOUNT",
        "A paid income must have a positive amount before revenue can be allocated.",
      );
    }

    let agreements: RevenueAgreementEntity[] = [];

    if (income.casePublicId) {
      agreements =
        await this.revenueAgreementRepository.findEffectiveForCase(
          {
            companyId: income.companyId,
            casePublicId: income.casePublicId,
            incomeDate: income.incomeDate,
          },
          manager,
        );
    }

    const percentageAgreements = agreements
      .filter(
        (agreement) =>
          agreement.compensationType ===
          CompensationType.PERCENTAGE,
      )
      .sort(this.sortAgreements);

    const fixedAgreements = agreements
      .filter(
        (agreement) =>
          agreement.compensationType ===
          CompensationType.FIXED,
      )
      .sort(this.sortAgreements);

    const percentageTotal = percentageAgreements.reduce(
      (total, agreement) =>
        total + Number(agreement.percentage ?? 0),
      0,
    );

    if (percentageTotal > 100.000001) {
      throw new ApiError(
        500,
        "INVALID_REVENUE_PERCENTAGE_STATE",
        "Effective revenue agreements exceed 100 percent.",
      );
    }

    const percentageRows =
      this.calculatePercentageAllocations(
        grossCents,
        percentageAgreements,
      );

    let allocatedCents = percentageRows.reduce(
      (total, row) => total + row.cents,
      0,
    );

    let remainingCents = grossCents - allocatedCents;

    const allocationPayloads: Partial<IncomeAllocationEntity>[] =
      [];

    let sequence = 1;

    /*
     * Percentage participants always calculate
     * against GROSS income.
     */
    for (const row of percentageRows) {
      const agreement = row.agreement;

      allocationPayloads.push({
        companyId: income.companyId,
        companyPublicId:
          income.companyPublicId ?? null,

        incomeId: Number(income.id),
        incomePublicId: income.publicId,

        caseId:
          income.caseId === null ||
          income.caseId === undefined
            ? null
            : String(income.caseId),

        casePublicId:
          income.casePublicId ?? null,

        ownerType: this.toOwnerType(
          agreement.participantType,
        ),

        ownerPublicId:
          agreement.participantPublicId,

        ownerName:
          agreement.participantName ?? null,

        revenueAgreementId:
          Number(agreement.id),

        revenueAgreementPublicId:
          agreement.publicId,

        compensationType:
          CompensationType.PERCENTAGE,

        percentageApplied:
          Number(agreement.percentage),

        fixedContractAmount: null,

        allocatedAmount:
          this.fromCents(row.cents),

        currency: income.currency,

        allocationSequence: sequence++,

        createdBy:
          createdBy ??
          income.createdBy ??
          null,
      });
    }

    /*
     * FIXED compensation consumes whatever remains
     * after percentages, following priority.
     *
     * The outstanding contract amount is DERIVED
     * from historical allocations. No mutable
     * "remaining balance" is stored.
     */
    for (const agreement of fixedAgreements) {
      if (remainingCents <= 0) {
        break;
      }

      const hasLaterAllocation =
        await this.allocationRepository
          .hasLaterAllocationForAgreement(
            Number(agreement.id),
            income.incomeDate,
            manager,
          );

      /*
       * A newly inserted backdated Income could
       * change which prior payment should have
       * satisfied a FIXED contract.
       *
       * Until a dedicated reallocation workflow
       * exists, reject that accounting mutation.
       */
      if (hasLaterAllocation) {
        throw new ApiError(
          409,
          "BACKDATED_INCOME_CONFLICTS_WITH_FIXED_ALLOCATIONS",
          "This income predates an existing fixed-compensation allocation. Existing allocations must be explicitly reprocessed before inserting this backdated paid income.",
        );
      }

      const fixedContractCents = this.toCents(
        Number(agreement.fixedAmount ?? 0),
      );

      const previouslyAllocated =
        await this.allocationRepository
          .sumAllocatedByAgreement(
            Number(agreement.id),
            manager,
          );

      const previouslyAllocatedCents =
        this.toCents(previouslyAllocated);

      const contractRemainingCents = Math.max(
        fixedContractCents -
          previouslyAllocatedCents,
        0,
      );

      if (contractRemainingCents <= 0) {
        continue;
      }

      const allocationCents = Math.min(
        remainingCents,
        contractRemainingCents,
      );

      allocationPayloads.push({
        companyId: income.companyId,
        companyPublicId:
          income.companyPublicId ?? null,

        incomeId: Number(income.id),
        incomePublicId: income.publicId,

        caseId:
          income.caseId === null ||
          income.caseId === undefined
            ? null
            : String(income.caseId),

        casePublicId:
          income.casePublicId ?? null,

        ownerType: this.toOwnerType(
          agreement.participantType,
        ),

        ownerPublicId:
          agreement.participantPublicId,

        ownerName:
          agreement.participantName ?? null,

        revenueAgreementId:
          Number(agreement.id),

        revenueAgreementPublicId:
          agreement.publicId,

        compensationType:
          CompensationType.FIXED,

        percentageApplied: null,

        fixedContractAmount:
          Number(agreement.fixedAmount),

        allocatedAmount:
          this.fromCents(allocationCents),

        currency: income.currency,

        allocationSequence: sequence++,

        createdBy:
          createdBy ??
          income.createdBy ??
          null,
      });

      remainingCents -= allocationCents;
      allocatedCents += allocationCents;
    }

    /*
     * Tenant receives the exact residual.
     *
     * We intentionally create the Tenant row even
     * when residual is zero. That gives every PAID
     * Income one complete immutable allocation set.
     */
    allocationPayloads.push({
      companyId: income.companyId,
      companyPublicId:
        income.companyPublicId ?? null,

      incomeId: Number(income.id),
      incomePublicId: income.publicId,

      caseId:
        income.caseId === null ||
        income.caseId === undefined
          ? null
          : String(income.caseId),

      casePublicId:
        income.casePublicId ?? null,

      ownerType: RevenueOwnerType.TENANT,

      ownerPublicId: null,
      ownerName: null,

      revenueAgreementId: null,
      revenueAgreementPublicId: null,

      compensationType: null,
      percentageApplied: null,
      fixedContractAmount: null,

      allocatedAmount:
        this.fromCents(remainingCents),

      currency: income.currency,

      allocationSequence: sequence,

      createdBy:
        createdBy ??
        income.createdBy ??
        null,
    });

    /*
     * Accounting invariant:
     *
     * Validate the exact rows that are about to
     * be persisted rather than relying on the
     * working accumulator.
     *
     * This makes the persistence payload itself
     * the source of truth for the invariant.
     */
    const persistedTotalCents =
      allocationPayloads.reduce(
        (total, allocation) => {
          const amount = Number(
            allocation.allocatedAmount ?? 0,
          );

          if (!Number.isFinite(amount)) {
            throw new ApiError(
              500,
              "INVALID_INCOME_ALLOCATION_VALUE",
              `Invalid allocation amount generated for owner ${allocation.ownerType ?? "UNKNOWN"}.`,
            );
          }

          return (
            total +
            this.toCents(amount)
          );
        },
        0,
      );

    if (
      persistedTotalCents !==
      grossCents
    ) {
      throw new ApiError(
        500,
        "INCOME_ALLOCATION_INVARIANT_FAILED",
        `Income allocations do not equal the paid income amount. Expected ${grossCents} cents but generated ${persistedTotalCents} cents.`,
      );
    }

    const entities =
      this.allocationRepository.createEntities(
        allocationPayloads,
        manager,
      );

    return this.allocationRepository.saveMany(
      entities,
      manager,
    );
  }

  private calculatePercentageAllocations(
    grossCents: number,
    agreements: RevenueAgreementEntity[],
  ): PercentageWorkingRow[] {
    const rows: PercentageWorkingRow[] =
      agreements.map((agreement) => {
        const percentage = Number(
          agreement.percentage ?? 0,
        );

        const exactCents =
          (grossCents * percentage) / 100;

        const floorCents =
          Math.floor(exactCents);

        return {
          agreement,
          cents: floorCents,
          fraction:
            exactCents - floorCents,
        };
      });

    const exactTotal = rows.reduce(
      (total, row) =>
        total +
        (grossCents *
          Number(row.agreement.percentage ?? 0)) /
          100,
      0,
    );

    /*
     * Round the percentage GROUP once, then use
     * largest remainder to distribute pennies.
     *
     * Example:
     * $0.01 split 50/50 cannot become $0.01 + $0.01.
     */
    const targetCents = Math.min(
      grossCents,
      Math.round(exactTotal),
    );

    const floorTotal = rows.reduce(
      (total, row) => total + row.cents,
      0,
    );

    let centsToDistribute =
      targetCents - floorTotal;

    const ranked = [...rows].sort(
      (a, b) =>
        b.fraction - a.fraction ||
        a.agreement.priority -
          b.agreement.priority ||
        Number(a.agreement.id) -
          Number(b.agreement.id),
    );

    let index = 0;

    while (
      centsToDistribute > 0 &&
      ranked.length > 0
    ) {
      ranked[index % ranked.length].cents += 1;

      centsToDistribute -= 1;
      index += 1;
    }

    return rows.sort((a, b) =>
      this.sortAgreements(
        a.agreement,
        b.agreement,
      ),
    );
  }

  private sortAgreements(
    a: RevenueAgreementEntity,
    b: RevenueAgreementEntity,
  ) {
    return (
      a.priority - b.priority ||
      Number(a.id) - Number(b.id)
    );
  }

  private toOwnerType(
    participantType: RevenueParticipantType,
  ): RevenueOwnerType {
    if (
      participantType ===
      RevenueParticipantType.ASSOCIATED_ATTORNEY
    ) {
      return RevenueOwnerType.ASSOCIATED_ATTORNEY;
    }

    return RevenueOwnerType.COUNSELOR;
  }

  private toCents(value: number) {
    return Math.round(Number(value) * 100);
  }

  private fromCents(cents: number) {
    return Number((cents / 100).toFixed(2));
  }
}