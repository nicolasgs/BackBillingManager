"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCategoryService = void 0;
const enums_1 = require("../../shared/enums");
const errors_1 = require("../../shared/errors");
const audit_log_service_1 = require("../audit-logs/audit-log.service");
const billing_category_repository_1 = require("./billing-category.repository");
class BillingCategoryService {
    constructor(repository = new billing_category_repository_1.BillingCategoryRepository(), auditLogService = new audit_log_service_1.AuditLogService()) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }
    async create(payload, authContext) {
        const existing = await this.repository.findExistingByCompanyNameAndType({
            companyId: payload.companyId,
            name: payload.name,
            type: payload.type,
        });
        if (existing) {
            throw new errors_1.ApiError(409, 'BILLING_CATEGORY_ALREADY_EXISTS', 'A billing category with this name and type already exists');
        }
        const categoryEntity = this.repository.createEntity(payload);
        const category = await this.repository.save(categoryEntity);
        await this.auditLogService.log({
            companyId: category.companyId,
            companyPublicId: category.companyPublicId,
            entityType: enums_1.AuditEntityType.BILLING_CATEGORY,
            entityId: category.id,
            entityPublicId: category.publicId,
            action: enums_1.AuditAction.CREATE,
            newValues: category,
            authContext,
        });
        return category;
    }
    async findAll(filters) {
        return this.repository.findAll(filters);
    }
    async findByPublicId(publicId, companyId) {
        const category = await this.repository.findByPublicId(publicId);
        if (!category || category.companyId !== companyId) {
            throw new errors_1.ApiError(404, 'BILLING_CATEGORY_NOT_FOUND', 'Billing category not found');
        }
        return category;
    }
    async update(publicId, payload, companyId, authContext) {
        const category = await this.findByPublicId(publicId, companyId);
        const originalCategory = {
            ...category,
        };
        Object.assign(category, payload);
        const updatedCategory = await this.repository.save(category);
        await this.auditLogService.log({
            companyId: updatedCategory.companyId,
            companyPublicId: updatedCategory.companyPublicId,
            entityType: enums_1.AuditEntityType.BILLING_CATEGORY,
            entityId: updatedCategory.id,
            entityPublicId: updatedCategory.publicId,
            action: enums_1.AuditAction.UPDATE,
            oldValues: originalCategory,
            newValues: updatedCategory,
            authContext,
        });
        return updatedCategory;
    }
    async softDelete(publicId, companyId, authContext) {
        const category = await this.findByPublicId(publicId, companyId);
        await this.repository.softDeleteById(category.id);
        await this.auditLogService.log({
            companyId: category.companyId,
            companyPublicId: category.companyPublicId,
            entityType: enums_1.AuditEntityType.BILLING_CATEGORY,
            entityId: category.id,
            entityPublicId: category.publicId,
            action: enums_1.AuditAction.DELETE,
            oldValues: category,
            authContext,
        });
        return {
            publicId: category.publicId,
            deleted: true,
        };
    }
}
exports.BillingCategoryService = BillingCategoryService;
