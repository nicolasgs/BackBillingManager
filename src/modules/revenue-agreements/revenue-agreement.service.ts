import {
  AuditAction,
  AuditEntityType,
  CompensationType,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";
import { AuditLogService } from "../audit-logs/audit-log.service";
import { AuthContext } from "../audit-logs/interfaces/auth-context.interface";
import {
  CreateRevenueAgreementDto,
  EndRevenueAgreementDto,
} from "./dto/revenue-agreement.dto";
import { RevenueAgreementFilters } from "./interfaces/revenue-agreement-filters.interface";
import { RevenueAgreementRepository } from "./revenue-agreement.repository";

export class RevenueAgreementService {
  constructor(
    private readonly repository =
      new RevenueAgreementRepository(),

    private readonly auditLogService =
      new AuditLogService(),
  ) {}

  async create(
    payload: CreateRevenueAgreementDto,
    authContext?: AuthContext,
  ) {
    /*
     * A participant cannot have more than one
     * currently open agreement for the same Case.
     */
    const existing =
      await this.repository.findActiveForParticipant({
        companyId: payload.companyId,
        casePublicId: payload.casePublicId,
        participantType: payload.participantType,
        participantPublicId:
          payload.participantPublicId,
      });

    if (existing) {
      throw new ApiError(
        409,
        "ACTIVE_REVENUE_AGREEMENT_EXISTS",
        "An active revenue agreement already exists for this participant and case",
      );
    }

    /*
     * Historical protection:
     *
     * Even if an older agreement has already been ended,
     * the new agreement cannot start inside that older
     * agreement's effective period.
     */
    const overlappingAgreement =
      await this.repository.findOverlappingForParticipant({
        companyId: payload.companyId,
        casePublicId: payload.casePublicId,
        participantType: payload.participantType,
        participantPublicId:
          payload.participantPublicId,
        effectiveFrom: payload.effectiveFrom,
      });

    if (overlappingAgreement) {
      throw new ApiError(
        409,
        "REVENUE_AGREEMENT_PERIOD_OVERLAP",
        "The new revenue agreement overlaps an existing agreement for this participant and case",
      );
    }

    let percentage: number | null = null;
    let fixedAmount: number | null = null;

    /*
     * Percentage agreements are calculated
     * against gross Income.
     *
     * All percentage agreements that overlap
     * the new agreement's future effective period
     * must remain <= 100%.
     */
    if (
      payload.compensationType ===
      CompensationType.PERCENTAGE
    ) {
      percentage = Number(
        Number(payload.percentage).toFixed(4),
      );

      const overlappingPercentageTotal =
        await this.repository.sumOverlappingPercentages({
          companyId: payload.companyId,
          casePublicId: payload.casePublicId,
          effectiveFrom: payload.effectiveFrom,
        });

      const resultingPercentage =
        overlappingPercentageTotal + percentage;

      if (resultingPercentage > 100.000001) {
        throw new ApiError(
          409,
          "CASE_REVENUE_PERCENTAGE_EXCEEDS_100",
          `Overlapping percentage agreements for this case would total ${resultingPercentage.toFixed(4)}%`,
        );
      }
    }

    if (
      payload.compensationType ===
      CompensationType.FIXED
    ) {
      fixedAmount = Number(
        Number(payload.fixedAmount).toFixed(2),
      );
    }

    const entity = this.repository.createEntity({
      companyId: payload.companyId,

      companyPublicId:
        payload.companyPublicId ?? null,

      caseId: payload.caseId ?? null,

      casePublicId:
        payload.casePublicId,

      participantType:
        payload.participantType,

      participantPublicId:
        payload.participantPublicId,

      participantName:
        payload.participantName ?? null,

      compensationType:
        payload.compensationType,

      percentage,

      fixedAmount,

      priority: payload.priority,

      effectiveFrom:
        payload.effectiveFrom,

      endedAt: null,

      createdBy:
        payload.createdBy ?? null,
    });

    let agreement;

    try {
      agreement =
        await this.repository.save(entity);
    } catch (error: any) {
      /*
       * PostgreSQL unique-index protection.
       * This also protects against concurrent
       * requests creating the same open agreement.
       */
      if (error?.code === "23505") {
        throw new ApiError(
          409,
          "ACTIVE_REVENUE_AGREEMENT_EXISTS",
          "An active revenue agreement already exists for this participant and case",
        );
      }

      throw error;
    }

    await this.auditLogService.log({
      companyId:
        agreement.companyId,

      companyPublicId:
        agreement.companyPublicId,

      entityType:
        AuditEntityType.REVENUE_AGREEMENT,

      entityId:
        agreement.id,

      entityPublicId:
        agreement.publicId,

      action:
        AuditAction.CREATE,

      newValues:
        agreement,

      authContext,
    });

    return agreement;
  }

  async findAll(
    filters: RevenueAgreementFilters,
  ) {
    return this.repository.findAll(filters);
  }

  async findByPublicId(
    publicId: string,
    companyId: number,
  ) {
    const agreement =
      await this.repository.findByPublicId(
        publicId,
      );

    if (
      !agreement ||
      agreement.companyId !== companyId
    ) {
      throw new ApiError(
        404,
        "REVENUE_AGREEMENT_NOT_FOUND",
        "Revenue agreement not found",
      );
    }

    return agreement;
  }

  async end(
    publicId: string,
    payload: EndRevenueAgreementDto,
    companyId: number,
    authContext?: AuthContext,
  ) {
    const agreement =
      await this.findByPublicId(
        publicId,
        companyId,
      );

    /*
     * Idempotent end operation.
     */
    if (agreement.endedAt) {
      return agreement;
    }

    if (
      payload.endedAt <
      agreement.effectiveFrom
    ) {
      throw new ApiError(
        400,
        "INVALID_REVENUE_AGREEMENT_END_DATE",
        "endedAt cannot be earlier than effectiveFrom",
      );
    }

    const oldValues = {
      endedAt:
        agreement.endedAt,
    };

    agreement.endedAt =
      payload.endedAt;

    const updated =
      await this.repository.save(
        agreement,
      );

    await this.auditLogService.log({
      companyId:
        updated.companyId,

      companyPublicId:
        updated.companyPublicId,

      entityType:
        AuditEntityType.REVENUE_AGREEMENT,

      entityId:
        updated.id,

      entityPublicId:
        updated.publicId,

      action:
        AuditAction.UPDATE,

      oldValues,

      newValues: {
        endedAt:
          updated.endedAt,
      },

      authContext,
    });

    return updated;
  }
}
