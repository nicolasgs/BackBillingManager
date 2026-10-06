import { EntityManager, IsNull } from "typeorm";

import { IncomeEntity } from "../incomes/income.entity";
import { IncomeAllocationEntity } from "./income-allocation.entity";

export class IncomeAllocationRepository {
  createEntities(
    payloads: Partial<IncomeAllocationEntity>[],
    manager: EntityManager,
  ) {
    return manager
      .getRepository(IncomeAllocationEntity)
      .create(payloads);
  }

  saveMany(
    entities: IncomeAllocationEntity[],
    manager: EntityManager,
  ) {
    return manager
      .getRepository(IncomeAllocationEntity)
      .save(entities);
  }

  findByIncomeId(
    incomeId: number,
    manager: EntityManager,
  ) {
    return manager
      .getRepository(IncomeAllocationEntity)
      .find({
        where: {
          incomeId,
          deletedAt: IsNull(),
        },
        order: {
          allocationSequence: "ASC",
          id: "ASC",
        },
      });
  }

  async hasAllocations(
    incomeId: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const count = await manager
      .getRepository(IncomeAllocationEntity)
      .count({
        where: {
          incomeId,
          deletedAt: IsNull(),
        },
      });

    return count > 0;
  }

  async sumAllocatedByAgreement(
    revenueAgreementId: number,
    manager: EntityManager,
  ): Promise<number> {
    const result = await manager
      .getRepository(IncomeAllocationEntity)
      .createQueryBuilder("allocation")
      .select(
        "COALESCE(SUM(allocation.allocatedAmount), 0)",
        "total",
      )
      .where(
        "allocation.revenueAgreementId = :revenueAgreementId",
        {
          revenueAgreementId,
        },
      )
      .andWhere("allocation.deletedAt IS NULL")
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async hasLaterAllocationForAgreement(
    revenueAgreementId: number,
    incomeDate: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const count = await manager
      .getRepository(IncomeAllocationEntity)
      .createQueryBuilder("allocation")
      .innerJoin(
        IncomeEntity,
        "income",
        "income.id = allocation.incomeId",
      )
      .where(
        "allocation.revenueAgreementId = :revenueAgreementId",
        {
          revenueAgreementId,
        },
      )
      .andWhere("allocation.deletedAt IS NULL")
      .andWhere("income.deletedAt IS NULL")
      .andWhere("income.incomeDate > :incomeDate", {
        incomeDate,
      })
      .getCount();

    return count > 0;
  }
}