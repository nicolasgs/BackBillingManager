"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const audit_log_repository_1 = require("./audit-log.repository");
class AuditLogService {
    constructor(repository = new audit_log_repository_1.AuditLogRepository()) {
        this.repository = repository;
    }
    async log(payload) {
        const ctx = payload.authContext;
        const log = this.repository.createEntity({
            companyId: payload.companyId,
            companyPublicId: payload.companyPublicId ?? ctx?.companyPublicId ?? null,
            entityType: payload.entityType,
            entityId: payload.entityId ?? null,
            entityPublicId: payload.entityPublicId ?? null,
            action: payload.action,
            oldValues: payload.oldValues ?? null,
            newValues: payload.newValues ?? null,
            performedBy: ctx?.userId ?? null,
            performedByEmail: ctx?.userEmail ?? null,
            performedByUsername: ctx?.username ?? null,
            performedByRole: ctx?.userRole ?? null,
            ipAddress: ctx?.ipAddress ?? null,
            userAgent: ctx?.userAgent ?? null,
        });
        return this.repository.save(log);
    }
    async findAll(filters) {
        return this.repository.findAll(filters);
    }
}
exports.AuditLogService = AuditLogService;
