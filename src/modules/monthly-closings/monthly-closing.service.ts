import {
  AuditAction,
  AuditEntityType,
  ClosingItemType,
  ClosingStatus,
} from "../../shared/enums";
import { ApiError } from "../../shared/errors";
import { AuditLogService } from "../audit-logs/audit-log.service";
import { AuthContext } from "../audit-logs/interfaces/auth-context.interface";
import {
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

    const incomes = await this.repository.findPaidIncomesForPeriod(
      closing.companyId,
      closing.year,
      closing.month,
    );

    const expenses = await this.repository.findPaidExpensesForPeriod(
      closing.companyId,
      closing.year,
      closing.month,
    );

    const totalIncome = incomes.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const totalExpense = expenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const netAmount = totalIncome - totalExpense;

    await this.repository.deleteItemsByClosingId(closing.id);

    const incomeItems = incomes.map((income) => ({
      monthlyClosingId: closing.id,
      companyId: closing.companyId,
      companyPublicId: closing.companyPublicId,
      entityType: ClosingItemType.INCOME,
      entityId: income.id,
      entityPublicId: income.publicId,
      amount: Number(income.amount),
      transactionDate: income.incomeDate,
      categoryId: income.categoryId,
      entityDescription: income.description ?? null,
      categoryName: income.category?.name ?? null,
    }));

    const expenseItems = expenses.map((expense) => ({
      monthlyClosingId: closing.id,
      companyId: closing.companyId,
      companyPublicId: closing.companyPublicId,
      entityType: ClosingItemType.EXPENSE,
      entityId: expense.id,
      entityPublicId: expense.publicId,
      amount: Number(expense.amount),
      transactionDate: expense.expenseDate,
      categoryId: expense.categoryId,
      entityDescription: expense.description ?? expense.vendorName ?? null,

      categoryName: expense.category?.name ?? null,
    }));

    const items = this.repository.createItems([
      ...incomeItems,
      ...expenseItems,
    ]);

    if (items.length > 0) {
      await this.repository.saveItems(items);
    }

    closing.totalIncome = Number(totalIncome.toFixed(2));
    closing.totalExpense = Number(totalExpense.toFixed(2));
    closing.netAmount = Number(netAmount.toFixed(2));
    closing.status = ClosingStatus.CLOSED;
    closing.closedBy = closedBy;
    closing.closedAt = new Date();

    const result = await this.repository.save(closing);

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
        totalIncome: result.totalIncome,
        totalExpense: result.totalExpense,
        netAmount: result.netAmount,
        closedBy: result.closedBy,
        closedAt: result.closedAt,
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

    closing.status = ClosingStatus.REOPENED;
    closing.notes = payload.notes ?? closing.notes;
    closing.closedBy = null;
    closing.closedAt = null;

    const result = await this.repository.save(closing);

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
