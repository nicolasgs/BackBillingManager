import {
  EntityManager,
  IsNull,
} from "typeorm";

import { AppDataSource } from "../../bootstrap/database";
import {
  ClosingStatus,
  ClosingType,
  ParticipantPayoutStatus,
  ParticipantSettlementStatus,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";
import { MonthlyClosingParticipantStatementEntity } from "../monthly-closings/monthly-closing-participant-statement.entity";
import { MonthlyClosingEntity } from "../monthly-closings/monthly-closing.entity";
import { PaymentMethodTypeEntity } from "../payment-method-type/payment-method-type.entity";
import {
  CreateParticipantPayoutDto,
  CreateParticipantSettlementDto,
  VoidParticipantPayoutDto,
} from "./dto/participant-settlement.dto";
import { ParticipantSettlementFilters } from "./interfaces/participant-settlement-filters.interface";
import { ParticipantPayoutEntity } from "./participant-payout.entity";
import { ParticipantSettlementEntity } from "./participant-settlement.entity";

const toCents = (value: number): number =>
  Math.round(Number(value) * 100);

const fromCents = (value: number): number =>
  Number((value / 100).toFixed(2));

export type SettlementBalanceSnapshot = {
  status: ParticipantSettlementStatus;
  statementNetAmount: number;
  amountDue: number;
  paidAmount: number;
  outstandingAmount: number;
  settledBy: string | null;
  settledAt: Date | null;
};

export type CreateSettlementResult = {
  settlement: ParticipantSettlementEntity;
  created: boolean;
};

export type CreatePayoutResult = {
  settlement: ParticipantSettlementEntity;
  payout: ParticipantPayoutEntity;
  created: boolean;
  settlementBefore: SettlementBalanceSnapshot;
};

export type VoidPayoutResult = {
  settlement: ParticipantSettlementEntity;
  payout: ParticipantPayoutEntity;
  voided: boolean;
  payoutBefore: Partial<ParticipantPayoutEntity>;
  settlementBefore: SettlementBalanceSnapshot;
};

export class ParticipantSettlementRepository {
  private settlementRepository =
    AppDataSource.getRepository(
      ParticipantSettlementEntity,
    );

  private snapshotSettlement(
    settlement: ParticipantSettlementEntity,
  ): SettlementBalanceSnapshot {
    return {
      status: settlement.status,
      statementNetAmount:
        Number(settlement.statementNetAmount),
      amountDue:
        Number(settlement.amountDue),
      paidAmount:
        Number(settlement.paidAmount),
      outstandingAmount:
        Number(settlement.outstandingAmount),
      settledBy:
        settlement.settledBy ?? null,
      settledAt:
        settlement.settledAt ?? null,
    };
  }

  async findAll(
    filters: ParticipantSettlementFilters,
  ) {
    const query =
      this.settlementRepository
        .createQueryBuilder("settlement")
        .leftJoinAndSelect(
          "settlement.participantStatement",
          "statement",
        )
        .leftJoinAndSelect(
          "statement.monthlyClosing",
          "closing",
        )
        .where(
          "settlement.companyId = :companyId",
          {
            companyId: filters.companyId,
          },
        )
        .andWhere(
          "settlement.deletedAt IS NULL",
        )
        .andWhere(
          "statement.deletedAt IS NULL",
        )
        .andWhere(
          "closing.deletedAt IS NULL",
        );

    if (filters.status) {
      query.andWhere(
        "settlement.status = :status",
        {
          status: filters.status,
        },
      );
    }

    if (filters.ownerType) {
      query.andWhere(
        "settlement.ownerType = :ownerType",
        {
          ownerType: filters.ownerType,
        },
      );
    }

    if (filters.ownerPublicId) {
      query.andWhere(
        "settlement.ownerPublicId = :ownerPublicId",
        {
          ownerPublicId:
            filters.ownerPublicId,
        },
      );
    }

    if (
      filters.participantStatementPublicId
    ) {
      query.andWhere(
        "statement.publicId = :statementPublicId",
        {
          statementPublicId:
            filters.participantStatementPublicId,
        },
      );
    }

    if (filters.year) {
      query.andWhere(
        "closing.year = :year",
        {
          year: filters.year,
        },
      );
    }

    if (filters.month) {
      query.andWhere(
        "closing.month = :month",
        {
          month: filters.month,
        },
      );
    }

    return query
      .orderBy(
        "closing.year",
        "DESC",
      )
      .addOrderBy(
        "closing.month",
        "DESC",
      )
      .addOrderBy(
        "settlement.createdAt",
        "DESC",
      )
      .getMany();
  }

  async findByPublicId(
    publicId: string,
    companyId: number,
  ) {
    return this.settlementRepository
      .createQueryBuilder("settlement")
      .leftJoinAndSelect(
        "settlement.participantStatement",
        "statement",
      )
      .leftJoinAndSelect(
        "statement.monthlyClosing",
        "closing",
      )
      .leftJoinAndSelect(
        "settlement.payouts",
        "payout",
        "payout.deletedAt IS NULL",
      )
      .leftJoinAndSelect(
        "payout.paymentMethod",
        "paymentMethod",
      )
      .where(
        "settlement.publicId = :publicId",
        {
          publicId,
        },
      )
      .andWhere(
        "settlement.companyId = :companyId",
        {
          companyId,
        },
      )
      .andWhere(
        "settlement.deletedAt IS NULL",
      )
      .andWhere(
        "statement.deletedAt IS NULL",
      )
      .andWhere(
        "closing.deletedAt IS NULL",
      )
      .orderBy(
        "payout.payoutDate",
        "DESC",
      )
      .addOrderBy(
        "payout.createdAt",
        "DESC",
      )
      .getOne();
  }

  async createFromStatement(
    statementPublicId: string,
    payload:
      CreateParticipantSettlementDto,
    companyId: number,
    createdBy: string,
  ): Promise<CreateSettlementResult> {
    return AppDataSource.transaction(
      async (manager) => {
        const statementRepository =
          manager.getRepository(
            MonthlyClosingParticipantStatementEntity,
          );

        const closingRepository =
          manager.getRepository(
            MonthlyClosingEntity,
          );

        const settlementRepository =
          manager.getRepository(
            ParticipantSettlementEntity,
          );

        /*
         * First locate the immutable participant
         * statement so we know which monthly closing
         * must be locked.
         */
        const statement =
          await statementRepository.findOne({
            where: {
              publicId: statementPublicId,
              companyId,
              deletedAt: IsNull(),
            },
          });

        if (!statement) {
          throw new ApiError(
            404,
            "PARTICIPANT_STATEMENT_NOT_FOUND",
            "Participant statement not found",
          );
        }

        /*
         * Lock the monthly closing first.
         *
         * Reopen and settlement creation therefore
         * serialize against the same accounting
         * period row.
         */
        const closing =
          await closingRepository.findOne({
            where: {
              id: statement.monthlyClosingId,
              companyId,
              deletedAt: IsNull(),
            },
            lock: {
              mode: "pessimistic_write",
            },
          });

        if (!closing) {
          throw new ApiError(
            409,
            "PARTICIPANT_SETTLEMENT_CLOSING_NOT_FOUND",
            "Monthly closing for participant statement was not found",
          );
        }

        if (
          closing.status !==
          ClosingStatus.CLOSED
        ) {
          throw new ApiError(
            409,
            "PARTICIPANT_SETTLEMENT_REQUIRES_CLOSED_PERIOD",
            "Participant settlement can only be created from a closed monthly closing",
          );
        }

        if (
          closing.closingType !==
          ClosingType.FINAL
        ) {
          throw new ApiError(
            409,
            "PARTICIPANT_SETTLEMENT_REQUIRES_FINAL_CLOSING",
            "Participant settlement can only be created from a FINAL monthly closing",
          );
        }

        const lockedStatement =
          await statementRepository.findOne({
            where: {
              id: statement.id,
              companyId,
              deletedAt: IsNull(),
            },
            lock: {
              mode: "pessimistic_write",
            },
          });

        if (!lockedStatement) {
          throw new ApiError(
            409,
            "PARTICIPANT_STATEMENT_NOT_AVAILABLE",
            "Participant statement is no longer available",
          );
        }

        /*
         * Settlement creation is idempotent.
         */
        const existing =
          await settlementRepository.findOne({
            where: {
              participantStatementId:
                lockedStatement.id,
              deletedAt: IsNull(),
            },
          });

        if (existing) {
          return {
            settlement: existing,
            created: false,
          };
        }

        const statementNetCents =
          toCents(
            lockedStatement.netAmount,
          );

        const amountDueCents =
          Math.max(
            statementNetCents,
            0,
          );

        const noPaymentDue =
          amountDueCents === 0;

        const settlement =
          settlementRepository.create({
            participantStatementId:
              lockedStatement.id,

            companyId:
              lockedStatement.companyId,

            companyPublicId:
              lockedStatement.companyPublicId ??
              null,

            ownerType:
              lockedStatement.ownerType,

            ownerPublicId:
              lockedStatement.ownerPublicId ??
              null,

            ownerName:
              lockedStatement.ownerName ??
              null,

            statementNetAmount:
              fromCents(
                statementNetCents,
              ),

            amountDue:
              fromCents(
                amountDueCents,
              ),

            paidAmount: 0,

            outstandingAmount:
              fromCents(
                amountDueCents,
              ),

            status:
              noPaymentDue
                ? ParticipantSettlementStatus.NO_PAYMENT_DUE
                : ParticipantSettlementStatus.UNPAID,

            notes:
              payload.notes ?? null,

            settledBy:
              noPaymentDue
                ? createdBy
                : null,

            settledAt:
              noPaymentDue
                ? new Date()
                : null,

            createdBy,
          });

        const saved =
          await settlementRepository.save(
            settlement,
          );

        return {
          settlement: saved,
          created: true,
        };
      },
    );
  }

  private async recalculateSettlement(
    manager: EntityManager,
    settlement:
      ParticipantSettlementEntity,
    actorId: string,
  ) {
    const payoutRepository =
      manager.getRepository(
        ParticipantPayoutEntity,
      );

    const settlementRepository =
      manager.getRepository(
        ParticipantSettlementEntity,
      );

    const payouts =
      await payoutRepository.find({
        where: {
          settlementId:
            settlement.id,
          status:
            ParticipantPayoutStatus.POSTED,
          deletedAt: IsNull(),
        },
      });

    const paidCents =
      payouts.reduce(
        (sum, payout) =>
          sum +
          toCents(
            payout.amount,
          ),
        0,
      );

    const amountDueCents =
      toCents(
        settlement.amountDue,
      );

    if (
      paidCents >
      amountDueCents
    ) {
      throw new ApiError(
        409,
        "PARTICIPANT_SETTLEMENT_BALANCE_INVALID",
        "Posted payouts exceed the settlement amount due",
      );
    }

    settlement.paidAmount =
      fromCents(paidCents);

    settlement.outstandingAmount =
      fromCents(
        amountDueCents -
          paidCents,
      );

    if (
      amountDueCents === 0
    ) {
      settlement.status =
        ParticipantSettlementStatus.NO_PAYMENT_DUE;

      settlement.settledBy =
        settlement.settledBy ??
        actorId;

      settlement.settledAt =
        settlement.settledAt ??
        new Date();
    } else if (
      paidCents === 0
    ) {
      settlement.status =
        ParticipantSettlementStatus.UNPAID;

      settlement.settledBy =
        null;

      settlement.settledAt =
        null;
    } else if (
      paidCents <
      amountDueCents
    ) {
      settlement.status =
        ParticipantSettlementStatus.PARTIALLY_PAID;

      settlement.settledBy =
        null;

      settlement.settledAt =
        null;
    } else {
      settlement.status =
        ParticipantSettlementStatus.PAID;

      settlement.settledBy =
        settlement.settledBy ??
        actorId;

      settlement.settledAt =
        settlement.settledAt ??
        new Date();
    }

    return settlementRepository.save(
      settlement,
    );
  }

  async createPayout(
    settlementPublicId: string,
    payload:
      CreateParticipantPayoutDto,
    companyId: number,
    createdBy: string,
  ): Promise<CreatePayoutResult> {
    return AppDataSource.transaction(
      async (manager) => {
        const settlementRepository =
          manager.getRepository(
            ParticipantSettlementEntity,
          );

        const payoutRepository =
          manager.getRepository(
            ParticipantPayoutEntity,
          );

        const paymentMethodRepository =
          manager.getRepository(
            PaymentMethodTypeEntity,
          );

        const settlement =
          await settlementRepository.findOne({
            where: {
              publicId:
                settlementPublicId,
              companyId,
              deletedAt: IsNull(),
            },
            lock: {
              mode: "pessimistic_write",
            },
          });

        if (!settlement) {
          throw new ApiError(
            404,
            "PARTICIPANT_SETTLEMENT_NOT_FOUND",
            "Participant settlement not found",
          );
        }

        const normalizedProvider =
          payload.externalProvider ??
          null;

        const normalizedTransactionId =
          payload.externalTransactionId ??
          null;

        /*
         * External transaction idempotency is
         * checked before all mutable balance
         * validations.
         */
        if (
          normalizedProvider &&
          normalizedTransactionId
        ) {
          const existing =
            await payoutRepository.findOne({
              where: {
                companyId,
                externalProvider:
                  normalizedProvider,
                externalTransactionId:
                  normalizedTransactionId,
                deletedAt: IsNull(),
              },
            });

          if (existing) {
            const sameFinancialRequest =
              existing.settlementId ===
                settlement.id &&
              toCents(
                existing.amount,
              ) ===
                toCents(
                  payload.amount,
                ) &&
              existing.currency ===
                payload.currency &&
              existing.payoutDate ===
                payload.payoutDate &&
              existing.paymentMethodCode ===
                payload.paymentMethodCode;

            if (
              !sameFinancialRequest
            ) {
              throw new ApiError(
                409,
                "PARTICIPANT_PAYOUT_IDEMPOTENCY_CONFLICT",
                "The external transaction ID is already associated with a different payout request",
              );
            }

            return {
              settlement,
              payout: existing,
              created: false,
              settlementBefore:
                this.snapshotSettlement(
                  settlement,
                ),
            };
          }
        }

        const paymentMethod =
          await paymentMethodRepository.findOne({
            where: {
              code:
                payload.paymentMethodCode,
              deletedAt: IsNull(),
            },
          });

        if (!paymentMethod) {
          throw new ApiError(
            400,
            "PARTICIPANT_PAYOUT_PAYMENT_METHOD_INVALID",
            "Payment method is not active or does not exist",
          );
        }

        /*
         * Reconcile from payout history before
         * evaluating the new payment.
         */
        const reconciled =
          await this.recalculateSettlement(
            manager,
            settlement,
            createdBy,
          );

        const settlementBefore =
          this.snapshotSettlement(
            reconciled,
          );

        const amountDueCents =
          toCents(
            reconciled.amountDue,
          );

        const outstandingCents =
          toCents(
            reconciled.outstandingAmount,
          );

        const payoutCents =
          toCents(
            payload.amount,
          );

        if (
          amountDueCents === 0 ||
          reconciled.status ===
            ParticipantSettlementStatus.NO_PAYMENT_DUE
        ) {
          throw new ApiError(
            409,
            "PARTICIPANT_SETTLEMENT_NO_PAYMENT_DUE",
            "This settlement does not have an amount due",
          );
        }

        if (
          payoutCents >
          outstandingCents
        ) {
          throw new ApiError(
            409,
            "PARTICIPANT_SETTLEMENT_OVERPAYMENT",
            `Payout amount ${fromCents(
              payoutCents,
            )} exceeds outstanding amount ${fromCents(
              outstandingCents,
            )}`,
          );
        }

        const payout =
          payoutRepository.create({
            settlementId:
              reconciled.id,

            companyId:
              reconciled.companyId,

            companyPublicId:
              reconciled.companyPublicId ??
              null,

            amount:
              fromCents(
                payoutCents,
              ),

            currency:
              payload.currency,

            payoutDate:
              payload.payoutDate,

            paymentMethodCode:
              payload.paymentMethodCode,

            referenceNumber:
              payload.referenceNumber ??
              null,

            notes:
              payload.notes ?? null,

            status:
              ParticipantPayoutStatus.POSTED,

            externalProvider:
              normalizedProvider,

            externalTransactionId:
              normalizedTransactionId,

            voidedBy: null,
            voidedAt: null,
            voidReason: null,

            createdBy,
          });

        const savedPayout =
          await payoutRepository.save(
            payout,
          );

        const updatedSettlement =
          await this.recalculateSettlement(
            manager,
            reconciled,
            createdBy,
          );

        return {
          settlement:
            updatedSettlement,
          payout:
            savedPayout,
          created: true,
          settlementBefore,
        };
      },
    );
  }

  async voidPayout(
    payoutPublicId: string,
    payload:
      VoidParticipantPayoutDto,
    companyId: number,
    voidedBy: string,
  ): Promise<VoidPayoutResult> {
    return AppDataSource.transaction(
      async (manager) => {
        const payoutRepository =
          manager.getRepository(
            ParticipantPayoutEntity,
          );

        const settlementRepository =
          manager.getRepository(
            ParticipantSettlementEntity,
          );

        const payout =
          await payoutRepository.findOne({
            where: {
              publicId:
                payoutPublicId,
              companyId,
              deletedAt: IsNull(),
            },
            lock: {
              mode: "pessimistic_write",
            },
          });

        if (!payout) {
          throw new ApiError(
            404,
            "PARTICIPANT_PAYOUT_NOT_FOUND",
            "Participant payout not found",
          );
        }

        const settlement =
          await settlementRepository.findOne({
            where: {
              id:
                payout.settlementId,
              companyId,
              deletedAt: IsNull(),
            },
            lock: {
              mode: "pessimistic_write",
            },
          });

        if (!settlement) {
          throw new ApiError(
            409,
            "PARTICIPANT_PAYOUT_SETTLEMENT_NOT_FOUND",
            "Settlement associated with payout was not found",
          );
        }

        const settlementBefore =
          this.snapshotSettlement(
            settlement,
          );

        const payoutBefore = {
          id: payout.id,
          publicId:
            payout.publicId,
          amount:
            payout.amount,
          currency:
            payout.currency,
          payoutDate:
            payout.payoutDate,
          paymentMethodCode:
            payout.paymentMethodCode,
          referenceNumber:
            payout.referenceNumber ??
            null,
          status:
            payout.status,
          externalProvider:
            payout.externalProvider ??
            null,
          externalTransactionId:
            payout.externalTransactionId ??
            null,
          voidedBy:
            payout.voidedBy ??
            null,
          voidedAt:
            payout.voidedAt ??
            null,
          voidReason:
            payout.voidReason ??
            null,
        };

        /*
         * VOID is idempotent.
         */
        if (
          payout.status ===
          ParticipantPayoutStatus.VOIDED
        ) {
          return {
            settlement,
            payout,
            voided: false,
            payoutBefore,
            settlementBefore,
          };
        }

        payout.status =
          ParticipantPayoutStatus.VOIDED;

        payout.voidedBy =
          voidedBy;

        payout.voidedAt =
          new Date();

        payout.voidReason =
          payload.voidReason;

        const savedPayout =
          await payoutRepository.save(
            payout,
          );

        const updatedSettlement =
          await this.recalculateSettlement(
            manager,
            settlement,
            voidedBy,
          );

        return {
          settlement:
            updatedSettlement,
          payout:
            savedPayout,
          voided: true,
          payoutBefore,
          settlementBefore,
        };
      },
    );
  }
}