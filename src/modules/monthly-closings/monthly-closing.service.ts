import {
  AuditAction,
  AuditEntityType,
  ClosingStatus,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";
import { AuditLogService } from "../audit-logs/audit-log.service";
import { AuthContext } from "../audit-logs/interfaces/auth-context.interface";
import {
  CloseMonthlyClosingDto,
  CreateMonthlyClosingDto,
  ReopenMonthlyClosingDto,
} from "./dto/monthly-closing.dto";
import { MonthlyClosingFilters } from "./interfaces/monthly-closing-filters.interface";
import { MonthlyClosingRepository } from "./monthly-closing.repository";

export class MonthlyClosingService {
  constructor(
    private readonly repository = new MonthlyClosingRepository(),
    private readonly auditLogService = new AuditLogService(),
  ) {}

  async create(payload: CreateMonthlyClosingDto, authContext?: AuthContext) {
    const existing = await this.repository.findExistingPeriod(
      payload.companyId,
      payload.year,
      payload.month,
    );

    if (existing) {
      throw new ApiError(
        409,
        "MONTHLY_CLOSING_ALREADY_EXISTS",
        "Monthly closing already exists for this company and period",
      );
    }

    const closingEntity = this.repository.createEntity({
      ...payload,
      status: ClosingStatus.DRAFT,
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
    });

    const closing = await this.repository.save(closingEntity);

    await this.auditLogService.log({
      companyId: closing.companyId,
      companyPublicId: closing.companyPublicId,
      entityType: AuditEntityType.MONTHLY_CLOSING,
      entityId: closing.id,
      entityPublicId: closing.publicId,
      action: AuditAction.CREATE,
      newValues: closing,
      authContext,
    });

    return closing;
  }

  async findAll(filters: MonthlyClosingFilters) {
    return this.repository.findAll(filters);
  }

  async findByPublicId(publicId: string, companyId: number) {
    const closing = await this.repository.findByPublicId(publicId);

    if (!closing || closing.companyId !== companyId) {
      throw new ApiError(
        404,
        "MONTHLY_CLOSING_NOT_FOUND",
        "Monthly closing not found",
      );
    }

    return closing;
  }

  async close(
    publicId: string,
    payload: CloseMonthlyClosingDto,
    companyId: number,
    closedBy: string,
    authContext?: AuthContext,
  ) {
    const closing = await this.findByPublicId(publicId, companyId);

    if (closing.status === ClosingStatus.CLOSED) {
      throw new ApiError(
        400,
        "MONTHLY_CLOSING_ALREADY_CLOSED",
        "Monthly closing is already closed",
      );
    }

    const originalStatus = closing.status;

    const snapshot =
      await this.repository.closeWithSnapshots({
        closingId: closing.id,
        companyId: closing.companyId,
        closingType: payload.closingType,
        closedBy,
      });
    const result = await this.findByPublicId(publicId, companyId);

    await this.auditLogService.log({
      companyId: result.companyId,
      companyPublicId: result.companyPublicId,
      entityType: AuditEntityType.MONTHLY_CLOSING,
      entityId: result.id,
      entityPublicId: result.publicId,
      action: AuditAction.CLOSE,
      oldValues: {
        status: originalStatus,
      },
      newValues: {
        status: result.status,
        closingType: result.closingType,
        totalIncome: result.totalIncome,
        totalExpense: result.totalExpense,
        netAmount: result.netAmount,
        closedBy: result.closedBy,
        closedAt: result.closedAt,
        participantStatementCount:
          snapshot.participantStatementCount,
      },
      authContext,
    });

    return result;
  }

  async reopen(
    publicId: string,
    payload: ReopenMonthlyClosingDto,
    companyId: number,
    authContext?: AuthContext,
  ) {
    const closing = await this.findByPublicId(publicId, companyId);

    if (closing.status !== ClosingStatus.CLOSED) {
      throw new ApiError(
        400,
        "MONTHLY_CLOSING_NOT_CLOSED",
        "Only closed monthly closings can be reopened",
      );
    }

    const oldValues = {
      status: closing.status,
      closedBy: closing.closedBy,
      closedAt: closing.closedAt,
      notes: closing.notes,
    };

    const notes = payload.notes ?? closing.notes;

    await this.repository.updateById(closing.id, {
      status: ClosingStatus.REOPENED,

      notes,

      closedBy: null,
      closedAt: null,
    });

    const result = await this.findByPublicId(publicId, companyId);

    await this.auditLogService.log({
      companyId: result.companyId,
      companyPublicId: result.companyPublicId,
      entityType: AuditEntityType.MONTHLY_CLOSING,
      entityId: result.id,
      entityPublicId: result.publicId,
      action: AuditAction.REOPEN,
      oldValues,
      newValues: {
        status: result.status,
        notes: result.notes,
        closedBy: result.closedBy,
        closedAt: result.closedAt,
      },
      authContext,
    });

    return result;
  }
}
