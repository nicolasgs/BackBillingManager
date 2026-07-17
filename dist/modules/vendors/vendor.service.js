"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorService = void 0;
const errors_1 = require("../../shared/errors");
const vendor_repository_1 = require("./vendor.repository");
const audit_log_service_1 = require("../audit-logs/audit-log.service");
const enums_1 = require("../../shared/enums");
class VendorService {
    constructor(repository = new vendor_repository_1.VendorRepository(), auditLogService = new audit_log_service_1.AuditLogService()) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }
    async create(payload, authContext) {
        const existing = await this.repository.findExistingByCompanyAndName({
            companyId: payload.companyId,
            name: payload.name,
        });
        if (existing) {
            throw new errors_1.ApiError(409, 'VENDOR_ALREADY_EXISTS', 'A vendor with this name already exists for this company');
        }
        const vendorEntity = this.repository.createEntity(payload);
        const vendor = await this.repository.save(vendorEntity);
        await this.auditLogService.log({
            companyId: vendor.companyId,
            companyPublicId: vendor.companyPublicId,
            entityType: enums_1.AuditEntityType.VENDOR,
            entityId: vendor.id,
            entityPublicId: vendor.publicId,
            action: enums_1.AuditAction.CREATE,
            newValues: vendor,
            authContext,
        });
        return vendor;
    }
    async findAll(filters) {
        return this.repository.findAll(filters);
    }
    async findByPublicId(publicId, companyId) {
        const vendor = await this.repository.findByPublicId(publicId);
        if (!vendor || vendor.companyId !== companyId) {
            throw new errors_1.ApiError(404, 'VENDOR_NOT_FOUND', 'Vendor not found');
        }
        return vendor;
    }
    async update(publicId, payload, companyId, authContext) {
        const vendor = await this.findByPublicId(publicId, companyId);
        const originalVendor = {
            ...vendor,
        };
        Object.assign(vendor, payload);
        const updatedVendor = await this.repository.save(vendor);
        await this.auditLogService.log({
            companyId: updatedVendor.companyId,
            companyPublicId: updatedVendor.companyPublicId,
            entityType: enums_1.AuditEntityType.VENDOR,
            entityId: updatedVendor.id,
            entityPublicId: updatedVendor.publicId,
            action: enums_1.AuditAction.UPDATE,
            oldValues: originalVendor,
            newValues: updatedVendor,
            authContext,
        });
        return updatedVendor;
    }
    async softDelete(publicId, companyId, authContext) {
        const vendor = await this.findByPublicId(publicId, companyId);
        await this.repository.softDeleteById(vendor.id);
        await this.auditLogService.log({
            companyId: vendor.companyId,
            companyPublicId: vendor.companyPublicId,
            entityType: enums_1.AuditEntityType.VENDOR,
            entityId: vendor.id,
            entityPublicId: vendor.publicId,
            action: enums_1.AuditAction.DELETE,
            oldValues: vendor,
            authContext,
        });
        return {
            publicId: vendor.publicId,
            deleted: true,
        };
    }
}
exports.VendorService = VendorService;
