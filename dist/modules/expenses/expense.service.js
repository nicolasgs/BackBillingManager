"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = void 0;
const errors_1 = require("../../shared/errors");
const enums_1 = require("../../shared/enums");
const billing_category_repository_1 = require("../billing-categories/billing-category.repository");
const payment_method_type_repository_1 = require("../payment-method-type/payment-method-type.repository");
const vendor_repository_1 = require("../vendors/vendor.repository");
const expense_repository_1 = require("./expense.repository");
const period_lock_service_1 = require("../monthly-closings/services/period-lock.service");
const audit_log_service_1 = require("../audit-logs/audit-log.service");
const enums_2 = require("../../shared/enums");
class ExpenseService {
    constructor(expenseRepository = new expense_repository_1.ExpenseRepository(), categoryRepository = new billing_category_repository_1.BillingCategoryRepository(), paymentMethodRepository = new payment_method_type_repository_1.PaymentMethodTypeRepository(), vendorRepository = new vendor_repository_1.VendorRepository(), periodLockService = new period_lock_service_1.PeriodLockService(), auditLogService = new audit_log_service_1.AuditLogService()) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.vendorRepository = vendorRepository;
        this.periodLockService = periodLockService;
        this.auditLogService = auditLogService;
    }
    async create(payload, authContext) {
        const category = await this.categoryRepository.findByIdAndCompanyAndType({
            id: payload.categoryId,
            companyId: payload.companyId,
            type: enums_1.BillingCategoryType.EXPENSE,
        });
        await this.periodLockService.validateOpenPeriod(payload.companyId, payload.expenseDate);
        if (!category) {
            throw new errors_1.ApiError(400, 'INVALID_EXPENSE_CATEGORY', 'Invalid expense category');
        }
        const paymentMethod = await this.paymentMethodRepository.findByCode(payload.paymentMethodCode);
        if (!paymentMethod) {
            throw new errors_1.ApiError(400, 'INVALID_PAYMENT_METHOD', 'Invalid payment method');
        }
        let vendorName = payload.vendorName ?? null;
        let vendorPublicId = payload.vendorPublicId ?? null;
        if (payload.vendorId) {
            const vendor = await this.vendorRepository.findByIdAndCompany({
                id: payload.vendorId,
                companyId: payload.companyId,
            });
            if (!vendor) {
                throw new errors_1.ApiError(400, 'INVALID_VENDOR', 'Invalid vendor');
            }
            vendorName = vendor.name;
            vendorPublicId = vendor.publicId;
        }
        const expenseEntity = this.expenseRepository.createEntity({
            ...payload,
            vendorName,
            vendorPublicId,
            amount: Number(Number(payload.amount).toFixed(2)),
        });
        const expense = await this.expenseRepository.save(expenseEntity);
        await this.auditLogService.log({
            companyId: expense.companyId,
            companyPublicId: expense.companyPublicId,
            entityType: enums_2.AuditEntityType.EXPENSE,
            entityId: expense.id,
            entityPublicId: expense.publicId,
            action: enums_2.AuditAction.CREATE,
            newValues: expense,
            authContext,
        });
        return expense;
    }
    async findAll(filters) {
        return this.expenseRepository.findAll(filters);
    }
    async findByPublicId(publicId, companyId) {
        const expense = await this.expenseRepository.findByPublicId(publicId);
        if (!expense || expense.companyId !== companyId) {
            throw new errors_1.ApiError(404, 'EXPENSE_NOT_FOUND', 'Expense not found');
        }
        return expense;
    }
    async update(publicId, payload, companyId, authContext) {
        const expense = await this.findByPublicId(publicId, companyId);
        const originalExpense = {
            ...expense,
        };
        const transactionDate = payload.expenseDate ?? expense.expenseDate;
        await this.periodLockService.validateOpenPeriod(expense.companyId, transactionDate);
        const normalizedPayload = {
            ...payload,
            amount: payload.amount !== undefined
                ? Number(Number(payload.amount).toFixed(2))
                : undefined,
        };
        Object.assign(expense, normalizedPayload);
        const updatedExpense = await this.expenseRepository.save(expense);
        await this.auditLogService.log({
            companyId: updatedExpense.companyId,
            companyPublicId: updatedExpense.companyPublicId,
            entityType: enums_2.AuditEntityType.EXPENSE,
            entityId: updatedExpense.id,
            entityPublicId: updatedExpense.publicId,
            action: enums_2.AuditAction.UPDATE,
            oldValues: originalExpense,
            newValues: updatedExpense,
            authContext,
        });
        return updatedExpense;
    }
    async softDelete(publicId, companyId, authContext) {
        const expense = await this.findByPublicId(publicId, companyId);
        await this.periodLockService.validateOpenPeriod(expense.companyId, expense.expenseDate);
        await this.expenseRepository.softDeleteById(expense.id);
        await this.auditLogService.log({
            companyId: expense.companyId,
            companyPublicId: expense.companyPublicId,
            entityType: enums_2.AuditEntityType.EXPENSE,
            entityId: expense.id,
            entityPublicId: expense.publicId,
            action: enums_2.AuditAction.DELETE,
            oldValues: expense,
            authContext,
        });
        return {
            publicId: expense.publicId,
            deleted: true,
        };
    }
}
exports.ExpenseService = ExpenseService;
