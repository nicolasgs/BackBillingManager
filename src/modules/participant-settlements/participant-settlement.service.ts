import {
  AuditAction,
  AuditEntityType,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";
import { AuditLogService } from "../audit-logs/audit-log.service";
import { AuthContext } from "../audit-logs/interfaces/auth-context.interface";
import {
  CreateParticipantPayoutDto,
  CreateParticipantSettlementDto,
  VoidParticipantPayoutDto,
} from "./dto/participant-settlement.dto";
import { ParticipantSettlementFilters } from "./interfaces/participant-settlement-filters.interface";
import { ParticipantPayoutEntity } from "./participant-payout.entity";
import {
  ParticipantSettlementRepository,
  SettlementBalanceSnapshot,
} from "./participant-settlement.repository";
import { ParticipantSettlementEntity } from "./participant-settlement.entity";

const settlementAuditSnapshot = (
  settlement:
    ParticipantSettlementEntity,
) => ({
  status:
    settlement.status,
  statementNetAmount:
    settlement.statementNetAmount,
  amountDue:
    settlement.amountDue,
  paidAmount:
    settlement.paidAmount,
  outstandingAmount:
    settlement.outstandingAmount,
  settledBy:
    settlement.settledBy ??
    null,
  settledAt:
    settlement.settledAt ??
    null,
});

const payoutAuditSnapshot = (
  payout:
    ParticipantPayoutEntity,
) => ({
  publicId:
    payout.publicId,
  settlementId:
    payout.settlementId,
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
});

export class ParticipantSettlementService {
  constructor(
    private readonly repository =
      new ParticipantSettlementRepository(),

    private readonly auditLogService =
      new AuditLogService(),
  ) {}

  async findAll(
    filters:
      ParticipantSettlementFilters,
  ) {
    return this.repository.findAll(
      filters,
    );
  }

  async findByPublicId(
    publicId: string,
    companyId: number,
  ) {
    const settlement =
      await this.repository.findByPublicId(
        publicId,
        companyId,
      );

    if (!settlement) {
      throw new ApiError(
        404,
        "PARTICIPANT_SETTLEMENT_NOT_FOUND",
        "Participant settlement not found",
      );
    }

    return settlement;
  }

  async createFromStatement(
    statementPublicId: string,
    payload:
      CreateParticipantSettlementDto,
    companyId: number,
    createdBy: string,
    authContext?: AuthContext,
  ) {
    const result =
      await this.repository.createFromStatement(
        statementPublicId,
        payload,
        companyId,
        createdBy,
      );

    const settlement =
      await this.findByPublicId(
        result.settlement.publicId,
        companyId,
      );

    if (result.created) {
      await this.auditLogService.log({
        companyId:
          settlement.companyId,

        companyPublicId:
          settlement.companyPublicId,

        entityType:
          AuditEntityType.PARTICIPANT_SETTLEMENT,

        entityId:
          settlement.id,

        entityPublicId:
          settlement.publicId,

        action:
          AuditAction.CREATE,

        newValues: {
          participantStatementId:
            settlement.participantStatementId,

          ownerType:
            settlement.ownerType,

          ownerPublicId:
            settlement.ownerPublicId ??
            null,

          ownerName:
            settlement.ownerName ??
            null,

          ...settlementAuditSnapshot(
            settlement,
          ),
        },

        authContext,
      });
    }

    return {
      settlement,
      created:
        result.created,
    };
  }

  async createPayout(
    settlementPublicId: string,
    payload:
      CreateParticipantPayoutDto,
    companyId: number,
    createdBy: string,
    authContext?: AuthContext,
  ) {
    const result =
      await this.repository.createPayout(
        settlementPublicId,
        payload,
        companyId,
        createdBy,
      );

    const settlement =
      await this.findByPublicId(
        result.settlement.publicId,
        companyId,
      );

    const payout =
      settlement.payouts?.find(
        (item) =>
          item.publicId ===
          result.payout.publicId,
      ) ??
      result.payout;

    if (result.created) {
      await this.auditLogService.log({
        companyId:
          payout.companyId,

        companyPublicId:
          payout.companyPublicId,

        entityType:
          AuditEntityType.PARTICIPANT_PAYOUT,

        entityId:
          payout.id,

        entityPublicId:
          payout.publicId,

        action:
          AuditAction.CREATE,

        newValues:
          payoutAuditSnapshot(
            payout,
          ),

        authContext,
      });

      await this.auditLogService.log({
        companyId:
          settlement.companyId,

        companyPublicId:
          settlement.companyPublicId,

        entityType:
          AuditEntityType.PARTICIPANT_SETTLEMENT,

        entityId:
          settlement.id,

        entityPublicId:
          settlement.publicId,

        action:
          AuditAction.UPDATE,

        oldValues:
          result.settlementBefore,

        newValues:
          settlementAuditSnapshot(
            settlement,
          ),

        authContext,
      });
    }

    return {
      settlement,
      payout,
      created:
        result.created,
      idempotent:
        !result.created,
    };
  }

  async voidPayout(
    payoutPublicId: string,
    payload:
      VoidParticipantPayoutDto,
    companyId: number,
    voidedBy: string,
    authContext?: AuthContext,
  ) {
    const result =
      await this.repository.voidPayout(
        payoutPublicId,
        payload,
        companyId,
        voidedBy,
      );

    const settlement =
      await this.findByPublicId(
        result.settlement.publicId,
        companyId,
      );

    const payout =
      settlement.payouts?.find(
        (item) =>
          item.publicId ===
          result.payout.publicId,
      ) ??
      result.payout;

    if (result.voided) {
      await this.auditLogService.log({
        companyId:
          payout.companyId,

        companyPublicId:
          payout.companyPublicId,

        entityType:
          AuditEntityType.PARTICIPANT_PAYOUT,

        entityId:
          payout.id,

        entityPublicId:
          payout.publicId,

        action:
          AuditAction.VOID,

        oldValues:
          result.payoutBefore,

        newValues:
          payoutAuditSnapshot(
            payout,
          ),

        authContext,
      });

      await this.auditLogService.log({
        companyId:
          settlement.companyId,

        companyPublicId:
          settlement.companyPublicId,

        entityType:
          AuditEntityType.PARTICIPANT_SETTLEMENT,

        entityId:
          settlement.id,

        entityPublicId:
          settlement.publicId,

        action:
          AuditAction.UPDATE,

        oldValues:
          result.settlementBefore,

        newValues:
          settlementAuditSnapshot(
            settlement,
          ),

        authContext,
      });
    }

    return {
      settlement,
      payout,
      voided:
        result.voided,
      alreadyVoided:
        !result.voided,
    };
  }
}