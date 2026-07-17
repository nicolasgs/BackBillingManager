"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeService = void 0;
const errors_1 = require("../../shared/errors");
const enums_1 = require("../../shared/enums");
const billing_category_repository_1 = require("../billing-categories/billing-category.repository");
const payment_method_type_repository_1 = require("../payment-method-type/payment-method-type.repository");
const income_repository_1 = require("./income.repository");
const period_lock_service_1 = require("../monthly-closings/services/period-lock.service");
const audit_log_service_1 = require("../audit-logs/audit-log.service");
const enums_2 = require("../../shared/enums");
class IncomeService {
    constructor(incomeRepository = new income_repository_1.IncomeRepository(), categoryRepository = new billing_category_repository_1.BillingCategoryRepository(), paymentMethodRepository = new payment_method_type_repository_1.PaymentMethodTypeRepository(), periodLockService = new period_lock_service_1.PeriodLockService(), auditLogService = new audit_log_service_1.AuditLogService()) {
        this.incomeRepository = incomeRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.periodLockService = periodLockService;
        this.auditLogService = auditLogService;
    }
    async create(payload, authContext) {
        const category = await this.categoryRepository.findByIdAndCompanyAndType({
            id: payload.categoryId,
            companyId: payload.companyId,
            type: enums_1.BillingCategoryType.INCOME,
        });
        await this.periodLockService.validateOpenPeriod(payload.companyId, payload.incomeDate);
        if (!category) {
            throw new errors_1.ApiError(400, 'INVALID_INCOME_CATEGORY', 'Invalid income category');
        }
        const paymentMethod = await this.paymentMethodRepository.findByCode(payload.paymentMethodCode);
        if (!paymentMethod) {
            throw new errors_1.ApiError(400, 'INVALID_PAYMENT_METHOD', 'Invalid payment method');
        }
        const incomeEntity = this.incomeRepository.createEntity({
            ...payload,
            amount: Number(Number(payload.amount).toFixed(2)),
        });
        const income = await this.incomeRepository.save(incomeEntity);
        await this.auditLogService.log({
            companyId: income.companyId,
            companyPublicId: income.companyPublicId,
            entityType: enums_2.AuditEntityType.INCOME,
            entityId: income.id,
            entityPublicId: income.publicId,
            action: enums_2.AuditAction.CREATE,
            newValues: income,
            authContext,
        });
        return income;
    }
    async findAll(filters) {
        return this.incomeRepository.findAll(filters);
    }
    async findByPublicId(publicId, companyId) {
        const income = await this.incomeRepository.findByPublicId(publicId);
        if (!income || income.companyId !== companyId) {
            throw new errors_1.ApiError(404, 'INCOME_NOT_FOUND', 'Income not found');
        }
        return income;
    }
    async update(publicId, payload, companyId, authContext) {
        const income = await this.findByPublicId(publicId, companyId);
        const originalIncome = {
            ...income,
        };
        const transactionDate = payload.incomeDate ?? income.incomeDate;
        await this.periodLockService.validateOpenPeriod(income.companyId, transactionDate);
        const normalizedPayload = {
            ...payload,
            amount: payload.amount !== undefined
                ? Number(Number(payload.amount).toFixed(2))
                : undefined,
        };
        Object.assign(income, normalizedPayload);
        const updatedIncome = await this.incomeRepository.save(income);
        await this.auditLogService.log({
            companyId: updatedIncome.companyId,
            companyPublicId: updatedIncome.companyPublicId,
            entityType: enums_2.AuditEntityType.INCOME,
            entityId: updatedIncome.id,
            entityPublicId: updatedIncome.publicId,
            action: enums_2.AuditAction.UPDATE,
            oldValues: originalIncome,
            newValues: updatedIncome,
            authContext,
        });
        return updatedIncome;
    }
    async softDelete(publicId, companyId, authContext) {
        const income = await this.findByPublicId(publicId, companyId);
        await this.periodLockService.validateOpenPeriod(income.companyId, income.incomeDate);
        await this.incomeRepository.softDeleteById(income.id);
        await this.auditLogService.log({
            companyId: income.companyId,
            companyPublicId: income.companyPublicId,
            entityType: enums_2.AuditEntityType.INCOME,
            entityId: income.id,
            entityPublicId: income.publicId,
            action: enums_2.AuditAction.DELETE,
            oldValues: income,
            authContext,
        });
        return {
            publicId: income.publicId,
            deleted: true,
        };
    }
}
exports.IncomeService = IncomeService;
