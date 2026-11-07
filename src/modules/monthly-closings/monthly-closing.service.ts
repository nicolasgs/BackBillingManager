import { AppDataSource } from "../../bootstrap/database";
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

  async create(
    payload: CreateMonthlyClosingDto,
    authContext?: AuthContext,
  ) {
    return AppDataSource.transaction(
      async (manager) => {
        const existing =
          await this.repository.findExistingPeriod(
            payload.companyId,
            payload.year,
            payload.month,
            manager,
          );

        if (existing) {
          throw new ApiError(
            409,
            "MONTHLY_CLOSING_ALREADY_EXISTS",
            "Monthly closing already exists for this company and period",
          );
        }

        const closingEntity =
          this.repository.createEntity(
            {
              ...payload,
              status: ClosingStatus.DRAFT,
              totalIncome: 0,
              totalExpense: 0,
              netAmount: 0,
            },
            manager,
          );

        let closing;

        try {
          closing =
            await this.repository.save(
              closingEntity,
              manager,
            );
        } catch (error: any) {
          if (
            error?.code === "23505" &&
            error?.constraint ===
              "uq_monthly_closings_company_period"
          ) {
            throw new ApiError(
              409,
              "MONTHLY_CLOSING_ALREADY_EXISTS",
              "Monthly closing already exists for this company and period",
            );
          }

          throw error;
        }

        await this.auditLogService.log(
          {
            companyId:
              closing.companyId,
            companyPublicId:
              closing.companyPublicId,
            entityType:
              AuditEntityType.MONTHLY_CLOSING,
            entityId:
              closing.id,
            entityPublicId:
              closing.publicId,
            action:
              AuditAction.CREATE,
            newValues:
              closing,
            authContext,
          },
          manager,
        );

        return closing;
      },
    );
  }
  async findAll(filters: MonthlyClosingFilters) {
    return this.repository.findAll(filters);
  }

  async findByPublicId(publicId: string, companyId: number) {
    const closing =
      await this.repository.findByPublicId(
        publicId,
        companyId,
      );

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
    const initialClosing =
      await this.findByPublicId(
        publicId,
        companyId,
      );

    if (
      initialClosing.status ===
      ClosingStatus.CLOSED
    ) {
      throw new ApiError(
        400,
        "MONTHLY_CLOSING_ALREADY_CLOSED",
        "Monthly closing is already closed",
      );
    }

    return AppDataSource.transaction(
      async (manager) => {
        const snapshot =
          await this.repository.closeWithSnapshots(
            {
              closingId:
                initialClosing.id,
              companyId,
              closingType:
                payload.closingType,
              closedBy,
            },
            manager,
          );

        const result =
          await this.repository.findByPublicId(
            publicId,
            companyId,
            manager,
          );

        if (!result) {
          throw new ApiError(
            404,
            "MONTHLY_CLOSING_NOT_FOUND",
            "Monthly closing not found",
          );
        }

        await this.auditLogService.log(
          {
            companyId:
              result.companyId,
            companyPublicId:
              result.companyPublicId,
            entityType:
              AuditEntityType.MONTHLY_CLOSING,
            entityId:
              result.id,
            entityPublicId:
              result.publicId,
            action:
              AuditAction.CLOSE,
            oldValues: {
              status:
                snapshot.originalStatus,
            },
            newValues: {
              status:
                result.status,
              closingType:
                result.closingType,
              totalIncome:
                result.totalIncome,
              totalExpense:
                result.totalExpense,
              netAmount:
                result.netAmount,
              closedBy:
                result.closedBy,
              closedAt:
                result.closedAt,
              participantStatementCount:
                snapshot.participantStatementCount,
            },
            authContext,
          },
          manager,
        );

        return result;
      },
    );
  }
  async reopen(
    publicId: string,
    payload: ReopenMonthlyClosingDto,
    companyId: number,
    authContext?: AuthContext,
  ) {
    const initialClosing =
      await this.findByPublicId(
        publicId,
        companyId,
      );

    if (
      initialClosing.status !==
      ClosingStatus.CLOSED
    ) {
      throw new ApiError(
        400,
        "MONTHLY_CLOSING_NOT_CLOSED",
        "Only closed monthly closings can be reopened",
      );
    }

    return AppDataSource.transaction(
      async (manager) => {
        const transactionResult =
          await this.repository
            .reopenWithSettlementGuard(
              {
                closingId:
                  initialClosing.id,
                companyId,
                notes:
                  payload.notes,
              },
              manager,
            );

        const result =
          await this.repository.findByPublicId(
            publicId,
            companyId,
            manager,
          );

        if (!result) {
          throw new ApiError(
            404,
            "MONTHLY_CLOSING_NOT_FOUND",
            "Monthly closing not found",
          );
        }

        await this.auditLogService.log(
          {
            companyId:
              result.companyId,
            companyPublicId:
              result.companyPublicId,
            entityType:
              AuditEntityType.MONTHLY_CLOSING,
            entityId:
              result.id,
            entityPublicId:
              result.publicId,
            action:
              AuditAction.REOPEN,
            oldValues:
              transactionResult.oldValues,
            newValues: {
              status:
                result.status,
              notes:
                result.notes,
              closedBy:
                result.closedBy,
              closedAt:
                result.closedAt,
            },
            authContext,
          },
          manager,
        );

        return result;
      },
    );
  }
}
