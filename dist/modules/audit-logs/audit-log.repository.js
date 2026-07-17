"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogRepository = void 0;
const database_1 = require("../../bootstrap/database");
const audit_log_entity_1 = require("./audit-log.entity");
class AuditLogRepository {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(audit_log_entity_1.BillingAuditLogEntity);
    }
    createEntity(payload) {
        return this.repository.create(payload);
    }
    save(log) {
        return this.repository.save(log);
    }
    findAll(filters) {
        const query = this.repository
            .createQueryBuilder('audit')
            .where('audit.companyId = :companyId', { companyId: filters.companyId });
        if (filters.entityType) {
            query.andWhere('audit.entityType = :entityType', {
                entityType: filters.entityType,
            });
        }
        if (filters.entityId) {
            query.andWhere('audit.entityId = :entityId', {
                entityId: filters.entityId,
            });
        }
        if (filters.entityPublicId) {
            query.andWhere('audit.entityPublicId = :entityPublicId', {
                entityPublicId: filters.entityPublicId,
            });
        }
        if (filters.action) {
            query.andWhere('audit.action = :action', {
                action: filters.action,
            });
        }
        if (filters.fromDate) {
            query.andWhere('audit.createdAt >= :fromDate', {
                fromDate: filters.fromDate,
            });
        }
        if (filters.toDate) {
            query.andWhere('audit.createdAt <= :toDate', {
                toDate: `${filters.toDate} 23:59:59`,
            });
        }
        return query.orderBy('audit.createdAt', 'DESC').getMany();
    }
}
exports.AuditLogRepository = AuditLogRepository;
