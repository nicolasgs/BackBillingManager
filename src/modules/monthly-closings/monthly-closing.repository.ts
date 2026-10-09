import { Between, In, IsNull } from "typeorm";

import { AppDataSource } from "../../bootstrap/database";
import {
  ClosingItemType,
  ClosingStatus,
  ClosingType,
  RevenueOwnerType,
  TransactionStatus,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";
import { ExpenseEntity } from "../expenses/expense.entity";
import { IncomeAllocationEntity } from "../income-allocations/income-allocation.entity";
import { IncomeEntity } from "../incomes/income.entity";
import { MonthlyClosingFilters } from "./interfaces/monthly-closing-filters.interface";
import { MonthlyClosingItemEntity } from "./monthly-closing-item.entity";
import { MonthlyClosingParticipantStatementItemEntity } from "./monthly-closing-participant-statement-item.entity";
import { MonthlyClosingParticipantStatementEntity } from "./monthly-closing-participant-statement.entity";
import { MonthlyClosingEntity } from "./monthly-closing.entity";

type ParticipantLineDraft = {
  itemType: "INCOME_ALLOCATION" | "EXPENSE";
  sourceEntityId: number;
  sourceEntityPublicId: string;
  parentEntityId: number | null;
  parentEntityPublicId: string | null;
  caseId: string | number | null;
  casePublicId: string | null;
  amountCents: number;
  currency: string;
  transactionDate: string;
  categoryId: number | null;
  categoryName: string | null;
  description: string | null;
  referenceNumber: string | null;
};

type ParticipantAccumulator = {
  ownerType: RevenueOwnerType;
  ownerPublicId: string | null;
  ownerName: string | null;
  grossCents: number;
  expenseCents: number;
  lines: ParticipantLineDraft[];
};

export type MonthlyClosingSnapshotResult = {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  participantStatementCount: number;
};

export class MonthlyClosingRepository {
  private closingRepository = AppDataSource.getRepository(MonthlyClosingEntity);

  private itemRepository = AppDataSource.getRepository(
    MonthlyClosingItemEntity,
  );

  private incomeRepository = AppDataSource.getRepository(IncomeEntity);

  private expenseRepository = AppDataSource.getRepository(ExpenseEntity);

  createEntity(payload: Partial<MonthlyClosingEntity>) {
    return this.closingRepository.create(payload);
  }

  save(closing: MonthlyClosingEntity) {
    return this.closingRepository.save(closing);
  }

  updateById(id: number, payload: Partial<MonthlyClosingEntity>) {
    return this.closingRepository.update({ id }, payload);
  }

  findExistingPeriod(
    companyId: number,
    year: number,
    month: number,
  ) {
    return this.closingRepository.findOne({
      where: {
        companyId,
        year,
        month,
        deletedAt: IsNull(),
      },
    });
  }

  findAll(filters: MonthlyClosingFilters) {
    const query = this.closingRepository
      .createQueryBuilder("closing")
      .where("closing.companyId = :companyId", {
        companyId: filters.companyId,
      })
      .andWhere("closing.deletedAt IS NULL");

    if (filters.year) {
      query.andWhere("closing.year = :year", {
        year: filters.year,
      });
    }

    if (filters.month) {
      query.andWhere("closing.month = :month", {
        month: filters.month,
      });
    }

    if (filters.status) {
      query.andWhere("closing.status = :status", {
        status: filters.status,
      });
    }

    return query
      .orderBy("closing.year", "DESC")
      .addOrderBy("closing.month", "DESC")
      .getMany();
  }

  findByPublicId(publicId: string) {
    return this.closingRepository.findOne({
      where: {
        publicId,
        deletedAt: IsNull(),
      },
      relations: {
        items: true,
        participantStatements: {
          items: true,
        },
      },
    });
  }

  getPeriodRange(year: number, month: number) {
    const startDate =
      `${year}-${String(month).padStart(2, "0")}-01`;

    const lastDay =
      new Date(year, month, 0).getDate();

    const endDate =
      `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    return {
      startDate,
      endDate,
    };
  }

  findPaidIncomesForPeriod(
    companyId: number,
    year: number,
    month: number,
  ) {
    const { startDate, endDate } =
      this.getPeriodRange(year, month);

    return this.incomeRepository.find({
      where: {
        companyId,
        incomeDate: Between(startDate, endDate),
        status: TransactionStatus.PAID,
        deletedAt: IsNull(),
      },
      relations: {
        category: true,
      },
    });
  }

  findPaidExpensesForPeriod(
    companyId: number,
    year: number,
    month: number,
  ) {
    const { startDate, endDate } =
      this.getPeriodRange(year, month);

    return this.expenseRepository.find({
      where: {
        companyId,
        expenseDate: Between(startDate, endDate),
        status: TransactionStatus.PAID,
        deletedAt: IsNull(),
      },
      relations: {
        category: true,
      },
    });
  }

  async deleteItemsByClosingId(
    monthlyClosingId: number,
  ) {
    await this.itemRepository.delete({
      monthlyClosingId,
    });
  }

  createItems(
    items: Partial<MonthlyClosingItemEntity>[],
  ) {
    return this.itemRepository.create(items);
  }

  saveItems(
    items: MonthlyClosingItemEntity[],
  ) {
    return this.itemRepository.save(items);
  }

  async closeWithSnapshots(params: {
    closingId: number;
    companyId: number;
    closingType: ClosingType;
    closedBy: string;
  }): Promise<MonthlyClosingSnapshotResult> {
    return AppDataSource.transaction(async (manager) => {
      const closingRepository =
        manager.getRepository(MonthlyClosingEntity);

      const closing = await closingRepository.findOne({
        where: {
          id: params.closingId,
          companyId: params.companyId,
          deletedAt: IsNull(),
        },
        lock: {
          mode: "pessimistic_write",
        },
      });

      if (!closing) {
        throw new ApiError(
          404,
          "MONTHLY_CLOSING_NOT_FOUND",
          "Monthly closing not found",
        );
      }

      if (closing.status === ClosingStatus.CLOSED) {
        throw new ApiError(
          400,
          "MONTHLY_CLOSING_ALREADY_CLOSED",
          "Monthly closing is already closed",
        );
      }

      const { startDate, endDate } =
        this.getPeriodRange(
          closing.year,
          closing.month,
        );

      const incomeRepository =
        manager.getRepository(IncomeEntity);

      const expenseRepository =
        manager.getRepository(ExpenseEntity);

      const allocationRepository =
        manager.getRepository(IncomeAllocationEntity);

      const closingItemRepository =
        manager.getRepository(MonthlyClosingItemEntity);

      const statementRepository =
        manager.getRepository(
          MonthlyClosingParticipantStatementEntity,
        );

      const statementItemRepository =
        manager.getRepository(
          MonthlyClosingParticipantStatementItemEntity,
        );

      const incomes = await incomeRepository.find({
        where: {
          companyId: closing.companyId,
          incomeDate: Between(startDate, endDate),
          status: TransactionStatus.PAID,
          deletedAt: IsNull(),
        },
        relations: {
          category: true,
        },
      });

      const expenses = await expenseRepository.find({
        where: {
          companyId: closing.companyId,
          expenseDate: Between(startDate, endDate),
          status: TransactionStatus.PAID,
          deletedAt: IsNull(),
        },
        relations: {
          category: true,
        },
      });

      const incomeIds = incomes.map(
        (income) => income.id,
      );

      const allocations =
        incomeIds.length === 0
          ? []
          : await allocationRepository.find({
              where: {
                companyId: closing.companyId,
                incomeId: In(incomeIds),
                deletedAt: IsNull(),
              },
              order: {
                incomeId: "ASC",
                allocationSequence: "ASC",
                id: "ASC",
              },
            });

      const toCents = (value: number): number =>
        Math.round(Number(value) * 100);

      const fromCents = (value: number): number =>
        Number((value / 100).toFixed(2));

      const truncate = (
        value: string | null | undefined,
        maxLength: number,
      ): string | null => {
        if (!value) {
          return null;
        }

        return value.length <= maxLength
          ? value
          : value.slice(0, maxLength);
      };

      const incomeById = new Map(
        incomes.map((income) => [
          income.id,
          income,
        ]),
      );

      const allocationTotalsByIncome =
        new Map<number, number>();

      for (const allocation of allocations) {
        allocationTotalsByIncome.set(
          allocation.incomeId,
          (allocationTotalsByIncome.get(
            allocation.incomeId,
          ) ?? 0) +
            toCents(allocation.allocatedAmount),
        );
      }

      /*
       * Accounting invariant:
       *
       * Every PAID Income participating in the closing
       * must already have a complete Phase 4B allocation
       * whose sum exactly equals the Income amount.
       */
      for (const income of incomes) {
        const incomeCents =
          toCents(income.amount);

        const allocatedCents =
          allocationTotalsByIncome.get(income.id) ?? 0;

        if (incomeCents !== allocatedCents) {
          throw new ApiError(
            409,
            "MONTHLY_CLOSING_INCOME_ALLOCATION_MISMATCH",
            `Income ${income.publicId} has ${fromCents(
              allocatedCents,
            )} allocated but its amount is ${fromCents(
              incomeCents,
            )}.`,
          );
        }
      }

      const totalIncomeCents =
        incomes.reduce(
          (sum, income) =>
            sum + toCents(income.amount),
          0,
        );

      const totalExpenseCents =
        expenses.reduce(
          (sum, expense) =>
            sum + toCents(expense.amount),
          0,
        );

      const groups =
        new Map<string, ParticipantAccumulator>();

      const ownerKey = (
        ownerType: RevenueOwnerType,
        ownerPublicId: string | null,
      ) =>
        ownerType === RevenueOwnerType.TENANT
          ? RevenueOwnerType.TENANT
          : `${ownerType}:${ownerPublicId}`;

      const ensureGroup = (
        ownerType: RevenueOwnerType,
        ownerPublicId: string | null,
        ownerName: string | null,
      ): ParticipantAccumulator => {
        if (
          ownerType !== RevenueOwnerType.TENANT &&
          !ownerPublicId
        ) {
          throw new ApiError(
            409,
            "MONTHLY_CLOSING_OWNER_IDENTITY_INVALID",
            `Owner ${ownerType} is missing ownerPublicId.`,
          );
        }

        const normalizedPublicId =
          ownerType === RevenueOwnerType.TENANT
            ? null
            : ownerPublicId;

        const normalizedName =
          ownerType === RevenueOwnerType.TENANT
            ? null
            : ownerName;

        const key = ownerKey(
          ownerType,
          normalizedPublicId,
        );

        const existing = groups.get(key);

        if (existing) {
          if (
            !existing.ownerName &&
            normalizedName
          ) {
            existing.ownerName =
              normalizedName;
          }

          return existing;
        }

        const group: ParticipantAccumulator = {
          ownerType,
          ownerPublicId: normalizedPublicId,
          ownerName: normalizedName,
          grossCents: 0,
          expenseCents: 0,
          lines: [],
        };

        groups.set(key, group);

        return group;
      };

      /*
       * Tenant statement always exists,
       * even if its monthly balance is zero.
       */
      ensureGroup(
        RevenueOwnerType.TENANT,
        null,
        null,
      );

      for (const allocation of allocations) {
        const income =
          incomeById.get(allocation.incomeId);

        if (!income) {
          throw new ApiError(
            409,
            "MONTHLY_CLOSING_ALLOCATION_INCOME_NOT_FOUND",
            `Income for allocation ${allocation.publicId} was not found in the closing period.`,
          );
        }

        const group = ensureGroup(
          allocation.ownerType,
          allocation.ownerPublicId ?? null,
          allocation.ownerName ?? null,
        );

        const amountCents =
          toCents(allocation.allocatedAmount);

        group.grossCents += amountCents;

        group.lines.push({
          itemType: "INCOME_ALLOCATION",
          sourceEntityId: allocation.id,
          sourceEntityPublicId:
            allocation.publicId,
          parentEntityId: income.id,
          parentEntityPublicId:
            income.publicId,
          caseId:
            allocation.caseId ??
            income.caseId ??
            null,
          casePublicId:
            allocation.casePublicId ??
            income.casePublicId ??
            null,
          amountCents,
          currency:
            allocation.currency ??
            income.currency,
          transactionDate:
            income.incomeDate,
          categoryId:
            income.categoryId ?? null,
          categoryName:
            income.category?.name ?? null,
          description: truncate(
            income.description,
            255,
          ),
          referenceNumber:
            income.referenceNumber ?? null,
        });
      }

      for (const expense of expenses) {
        const ownerType =
          expense.attributedToType ??
          RevenueOwnerType.TENANT;

        const ownerPublicId =
          ownerType === RevenueOwnerType.TENANT
            ? null
            : expense.attributedToPublicId ??
              null;

        const ownerName =
          ownerType === RevenueOwnerType.TENANT
            ? null
            : expense.attributedToName ??
              null;

        const group = ensureGroup(
          ownerType,
          ownerPublicId,
          ownerName,
        );

        const amountCents =
          toCents(expense.amount);

        group.expenseCents += amountCents;

        group.lines.push({
          itemType: "EXPENSE",
          sourceEntityId: expense.id,
          sourceEntityPublicId:
            expense.publicId,
          parentEntityId: null,
          parentEntityPublicId: null,
          caseId:
            expense.caseId ?? null,
          casePublicId:
            expense.casePublicId ?? null,
          amountCents,
          currency: expense.currency,
          transactionDate:
            expense.expenseDate,
          categoryId:
            expense.categoryId ?? null,
          categoryName:
            expense.category?.name ?? null,
          description: truncate(
            expense.description ??
              expense.vendorName ??
              null,
            255,
          ),
          referenceNumber:
            expense.referenceNumber ?? null,
        });
      }

      const participantGroups =
        Array.from(groups.values());

      const participantGrossCents =
        participantGroups.reduce(
          (sum, group) =>
            sum + group.grossCents,
          0,
        );

      const participantExpenseCents =
        participantGroups.reduce(
          (sum, group) =>
            sum + group.expenseCents,
          0,
        );

      if (
        participantGrossCents !==
        totalIncomeCents
      ) {
        throw new ApiError(
          409,
          "MONTHLY_CLOSING_PARTICIPANT_INCOME_MISMATCH",
          "Participant gross allocated income does not reconcile with total paid income.",
        );
      }

      if (
        participantExpenseCents !==
        totalExpenseCents
      ) {
        throw new ApiError(
          409,
          "MONTHLY_CLOSING_PARTICIPANT_EXPENSE_MISMATCH",
          "Participant attributed expenses do not reconcile with total paid expenses.",
        );
      }

      /*
       * All validation is complete before replacing
       * the existing snapshots.
       */

      await closingItemRepository.delete({
        monthlyClosingId: closing.id,
      });

      await statementRepository.delete({
        monthlyClosingId: closing.id,
      });

      const incomeItems =
        incomes.map((income) => ({
          monthlyClosingId: closing.id,
          companyId: closing.companyId,
          companyPublicId:
            closing.companyPublicId,
          entityType:
            ClosingItemType.INCOME,
          entityId: income.id,
          entityPublicId:
            income.publicId,
          amount: fromCents(
            toCents(income.amount),
          ),
          transactionDate:
            income.incomeDate,
          categoryId:
            income.categoryId,
          entityDescription:
            truncate(
              income.description,
              255,
            ),
          categoryName:
            income.category?.name ?? null,
        }));

      const expenseItems =
        expenses.map((expense) => ({
          monthlyClosingId: closing.id,
          companyId: closing.companyId,
          companyPublicId:
            closing.companyPublicId,
          entityType:
            ClosingItemType.EXPENSE,
          entityId: expense.id,
          entityPublicId:
            expense.publicId,
          amount: fromCents(
            toCents(expense.amount),
          ),
          transactionDate:
            expense.expenseDate,
          categoryId:
            expense.categoryId,
          entityDescription:
            truncate(
              expense.description ??
                expense.vendorName ??
                null,
              255,
            ),
          categoryName:
            expense.category?.name ?? null,
        }));

      const closingItems =
        closingItemRepository.create([
          ...incomeItems,
          ...expenseItems,
        ]);

      if (closingItems.length > 0) {
        await closingItemRepository.save(
          closingItems,
        );
      }

      const statementEntities =
        statementRepository.create(
          participantGroups.map(
            (group) => ({
              monthlyClosingId:
                closing.id,
              companyId:
                closing.companyId,
              companyPublicId:
                closing.companyPublicId,
              ownerType:
                group.ownerType,
              ownerPublicId:
                group.ownerPublicId,
              ownerName:
                group.ownerName,
              grossAllocatedIncome:
                fromCents(
                  group.grossCents,
                ),
              attributedExpense:
                fromCents(
                  group.expenseCents,
                ),
              netAmount:
                fromCents(
                  group.grossCents -
                    group.expenseCents,
                ),
              createdBy:
                params.closedBy,
            }),
          ),
        );

      const savedStatements =
        await statementRepository.save(
          statementEntities,
        );

      const statementByOwner =
        new Map<string, number>();

      for (const statement of savedStatements) {
        statementByOwner.set(
          ownerKey(
            statement.ownerType,
            statement.ownerPublicId ??
              null,
          ),
          statement.id,
        );
      }

      const participantLineItems:
        Partial<MonthlyClosingParticipantStatementItemEntity>[] =
        [];

      for (const group of participantGroups) {
        const statementId =
          statementByOwner.get(
            ownerKey(
              group.ownerType,
              group.ownerPublicId,
            ),
          );

        if (!statementId) {
          throw new ApiError(
            500,
            "MONTHLY_CLOSING_STATEMENT_MAPPING_FAILED",
            "Participant statement could not be mapped after persistence.",
          );
        }

        for (const line of group.lines) {
          participantLineItems.push({
            participantStatementId:
              statementId,
            companyId:
              closing.companyId,
            companyPublicId:
              closing.companyPublicId,
            itemType:
              line.itemType,
            sourceEntityId:
              line.sourceEntityId,
            sourceEntityPublicId:
              line.sourceEntityPublicId,
            parentEntityId:
              line.parentEntityId,
            parentEntityPublicId:
              line.parentEntityPublicId,
            caseId:
              line.caseId,
            casePublicId:
              line.casePublicId,
            amount:
              fromCents(
                line.amountCents,
              ),
            currency:
              line.currency,
            transactionDate:
              line.transactionDate,
            categoryId:
              line.categoryId,
            categoryName:
              line.categoryName,
            description:
              line.description,
            referenceNumber:
              line.referenceNumber,
            createdBy:
              params.closedBy,
          });
        }
      }

      if (participantLineItems.length > 0) {
        const entities =
          statementItemRepository.create(
            participantLineItems,
          );

        await statementItemRepository.save(
          entities,
        );
      }

      const netAmountCents =
        totalIncomeCents -
        totalExpenseCents;

      await closingRepository.update(
        {
          id: closing.id,
        },
        {
          totalIncome:
            fromCents(totalIncomeCents),
          totalExpense:
            fromCents(totalExpenseCents),
          netAmount:
            fromCents(netAmountCents),
          closingType:
            params.closingType,
          status:
            ClosingStatus.CLOSED,
          closedBy:
            params.closedBy,
          closedAt:
            new Date(),
        },
      );

      return {
        totalIncome:
          fromCents(totalIncomeCents),
        totalExpense:
          fromCents(totalExpenseCents),
        netAmount:
          fromCents(netAmountCents),
        participantStatementCount:
          savedStatements.length,
      };
    });
  }

  async reopenWithSettlementGuard(params: {
    closingId: number;
    companyId: number;
    notes: string | null | undefined;
  }) {
    return AppDataSource.transaction(
      async (manager) => {
        const closingRepository =
          manager.getRepository(
            MonthlyClosingEntity,
          );

        const statementRepository =
          manager.getRepository(
            MonthlyClosingParticipantStatementEntity,
          );

        /*
         * Settlement creation locks this same
         * monthly_closings row. This makes
         * REOPEN vs settlement creation atomic.
         */
        const closing =
          await closingRepository.findOne({
            where: {
              id: params.closingId,
              companyId:
                params.companyId,
              deletedAt: IsNull(),
            },
            lock: {
              mode: "pessimistic_write",
            },
          });

        if (!closing) {
          throw new ApiError(
            404,
            "MONTHLY_CLOSING_NOT_FOUND",
            "Monthly closing not found",
          );
        }

        if (
          closing.status !==
          ClosingStatus.CLOSED
        ) {
          throw new ApiError(
            400,
            "MONTHLY_CLOSING_NOT_CLOSED",
            "Only closed monthly closings can be reopened",
          );
        }

        const settlementCount =
          await statementRepository
            .createQueryBuilder(
              "statement",
            )
            .innerJoin(
              "participant_settlements",
              "settlement",
              "settlement.participant_statement_id = statement.id AND settlement.deleted_at IS NULL",
            )
            .where(
              "statement.monthly_closing_id = :closingId",
              {
                closingId:
                  closing.id,
              },
            )
            .andWhere(
              "statement.deleted_at IS NULL",
            )
            .getCount();

        if (
          settlementCount > 0
        ) {
          throw new ApiError(
            409,
            "MONTHLY_CLOSING_HAS_SETTLEMENTS",
            "Monthly closing cannot be reopened because participant settlements already exist",
          );
        }

        await closingRepository.update(
          {
            id: closing.id,
          },
          {
            status:
              ClosingStatus.REOPENED,

            notes:
              params.notes,

            closedBy: null,
            closedAt: null,
          },
        );
      },
    );
  }
}