"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyClosingService = void 0;
const enums_1 = require("../../shared/enums");
const errors_1 = require("../../shared/errors");
const audit_log_service_1 = require("../audit-logs/audit-log.service");
const monthly_closing_repository_1 = require("./monthly-closing.repository");
class MonthlyClosingService {
    constructor(repository = new monthly_closing_repository_1.MonthlyClosingRepository(), auditLogService = new audit_log_service_1.AuditLogService()) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }
    async create(payload, authContext) {
        const existing = await this.repository.findExistingPeriod(payload.companyId, payload.year, payload.month);
        if (existing) {
            throw new errors_1.ApiError(409, 'MONTHLY_CLOSING_ALREADY_EXISTS', 'Monthly closing already exists for this company and period');
        }
        const closingEntity = this.repository.createEntity({
            ...payload,
            status: enums_1.ClosingStatus.DRAFT,
            totalIncome: 0,
            totalExpense: 0,
            netAmount: 0,
        });
        const closing = await this.repository.save(closingEntity);
        await this.auditLogService.log({
            companyId: closing.companyId,
            companyPublicId: closing.companyPublicId,
            entityType: enums_1.AuditEntityType.MONTHLY_CLOSING,
            entityId: closing.id,
            entityPublicId: closing.publicId,
            action: enums_1.AuditAction.CREATE,
            newValues: closing,
            authContext,
        });
        return closing;
    }
    async findAll(filters) {
        return this.repository.findAll(filters);
    }
    async findByPublicId(publicId, companyId) {
        const closing = await this.repository.findByPublicId(publicId);
        if (!closing || closing.companyId !== companyId) {
            throw new errors_1.ApiError(404, 'MONTHLY_CLOSING_NOT_FOUND', 'Monthly closing not found');
        }
        return closing;
    }
    async close(publicId, companyId, closedBy, authContext) {
        const closing = await this.findByPublicId(publicId, companyId);
        if (closing.status === enums_1.ClosingStatus.CLOSED) {
            throw new errors_1.ApiError(400, 'MONTHLY_CLOSING_ALREADY_CLOSED', 'Monthly closing is already closed');
        }
        const originalStatus = closing.status;
        const incomes = await this.repository.findPaidIncomesForPeriod(closing.companyId, closing.year, closing.month);
        const expenses = await this.repository.findPaidExpensesForPeriod(closing.companyId, closing.year, closing.month);
        const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
        const netAmount = totalIncome - totalExpense;
        await this.repository.deleteItemsByClosingId(closing.id);
        const incomeItems = incomes.map((income) => ({
            monthlyClosingId: closing.id,
            companyId: closing.companyId,
            companyPublicId: closing.companyPublicId,
            entityType: enums_1.ClosingItemType.INCOME,
            entityId: income.id,
            entityPublicId: income.publicId,
            amount: Number(income.amount),
            transactionDate: income.incomeDate,
            categoryId: income.categoryId,
        }));
        const expenseItems = expenses.map((expense) => ({
            monthlyClosingId: closing.id,
            companyId: closing.companyId,
            companyPublicId: closing.companyPublicId,
            entityType: enums_1.ClosingItemType.EXPENSE,
            entityId: expense.id,
            entityPublicId: expense.publicId,
            amount: Number(expense.amount),
            transactionDate: expense.expenseDate,
            categoryId: expense.categoryId,
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
        closing.status = enums_1.ClosingStatus.CLOSED;
        closing.closedBy = closedBy;
        closing.closedAt = new Date();
        const result = await this.repository.save(closing);
        await this.auditLogService.log({
            companyId: result.companyId,
            companyPublicId: result.companyPublicId,
            entityType: enums_1.AuditEntityType.MONTHLY_CLOSING,
            entityId: result.id,
            entityPublicId: result.publicId,
            action: enums_1.AuditAction.CLOSE,
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
    async reopen(publicId, payload, companyId, authContext) {
        const closing = await this.findByPublicId(publicId, companyId);
        if (closing.status !== enums_1.ClosingStatus.CLOSED) {
            throw new errors_1.ApiError(400, 'MONTHLY_CLOSING_NOT_CLOSED', 'Only closed monthly closings can be reopened');
        }
        const oldValues = {
            status: closing.status,
            closedBy: closing.closedBy,
            closedAt: closing.closedAt,
            notes: closing.notes,
        };
        closing.status = enums_1.ClosingStatus.REOPENED;
        closing.notes = payload.notes ?? closing.notes;
        closing.closedBy = null;
        closing.closedAt = null;
        const result = await this.repository.save(closing);
        await this.auditLogService.log({
            companyId: result.companyId,
            companyPublicId: result.companyPublicId,
            entityType: enums_1.AuditEntityType.MONTHLY_CLOSING,
            entityId: result.id,
            entityPublicId: result.publicId,
            action: enums_1.AuditAction.REOPEN,
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
exports.MonthlyClosingService = MonthlyClosingService;
