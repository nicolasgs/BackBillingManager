import { EntityManager, IsNull } from "typeorm";

import { ClosingStatus, ClosingType } from "../../../shared/enums";

import { ApiError } from "../../../shared/errors";

import { MonthlyClosingEntity } from "../monthly-closing.entity";

type AccountingPeriod = {
  year: number;
  month: number;
};

export class PeriodLockService {
  private getPeriod(
    transactionDate: string,
  ): AccountingPeriod {
    const date = new Date(
      `${transactionDate}T00:00:00`,
    );

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    };
  }

  async lockPeriod(
    companyId: number,
    year: number,
    month: number,
    manager: EntityManager,
  ): Promise<void> {
    /*
     * Serialize every accounting mutation for the
     * same company/year/month.
     *
     * Transaction-level advisory locks work even
     * when a monthly_closings row does not exist yet.
     */
    await manager.query(
      "SELECT pg_advisory_xact_lock($1::int, $2::int)",
      [
        companyId,
        year * 100 + month,
      ],
    );
  }

  async lockTransactionPeriod(
    companyId: number,
    transactionDate: string,
    manager: EntityManager,
  ): Promise<void> {
    const period =
      this.getPeriod(transactionDate);

    await this.lockPeriod(
      companyId,
      period.year,
      period.month,
      manager,
    );
  }

  async validateOpenPeriod(
    companyId: number,
    transactionDate: string,
    manager: EntityManager,
  ): Promise<void> {
    await this.validateOpenPeriods(
      companyId,
      [transactionDate],
      manager,
    );
  }

  async validateOpenPeriods(
    companyId: number,
    transactionDates: string[],
    manager: EntityManager,
  ): Promise<void> {
    /*
     * A transaction that moves accounting data
     * between periods must lock every affected
     * period in deterministic order to avoid
     * A->B / B->A deadlocks.
     */
    const periodsByKey =
      new Map<string, AccountingPeriod>();

    for (const transactionDate of transactionDates) {
      const period =
        this.getPeriod(transactionDate);

      periodsByKey.set(
        `${period.year}-${period.month}`,
        period,
      );
    }

    const periods =
      Array.from(
        periodsByKey.values(),
      ).sort(
        (left, right) =>
          left.year - right.year ||
          left.month - right.month,
      );

    for (const period of periods) {
      await this.lockPeriod(
        companyId,
        period.year,
        period.month,
        manager,
      );
    }

    const repository =
      manager.getRepository(
        MonthlyClosingEntity,
      );

    /*
     * Validate only after all required advisory
     * locks have been acquired. A concurrent close
     * therefore either happens before this check
     * or waits until this transaction commits.
     */
    for (const period of periods) {
      const closing =
        await repository.findOne({
          where: {
            companyId,
            year: period.year,
            month: period.month,
            status:
              ClosingStatus.CLOSED,
            closingType:
              ClosingType.FINAL,
            deletedAt: IsNull(),
          },
        });

      if (closing) {
        throw new ApiError(
          400,
          "PERIOD_FINAL_CLOSED",
          "The accounting period is final closed. Reopen the monthly closing before modifying transactions.",
        );
      }
    }
  }
}
