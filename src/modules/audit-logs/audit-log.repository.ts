import { AppDataSource } from '../../bootstrap/database'
import { BillingAuditLogEntity } from './audit-log.entity'
import { AuditLogFilters } from './interfaces/audit-log-filters.interface'

export class AuditLogRepository {
  private repository = AppDataSource.getRepository(BillingAuditLogEntity)

  createEntity(payload: Partial<BillingAuditLogEntity>) {
    return this.repository.create(payload)
  }

  save(log: BillingAuditLogEntity) {
    return this.repository.save(log)
  }

  findAll(filters: AuditLogFilters) {
    const query = this.repository
      .createQueryBuilder('audit')
      .where('audit.companyId = :companyId', { companyId: filters.companyId })

    if (filters.entityType) {
      query.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      })
    }

    if (filters.entityId) {
      query.andWhere('audit.entityId = :entityId', {
        entityId: filters.entityId,
      })
    }

    if (filters.entityPublicId) {
      query.andWhere('audit.entityPublicId = :entityPublicId', {
        entityPublicId: filters.entityPublicId,
      })
    }

    if (filters.action) {
      query.andWhere('audit.action = :action', {
        action: filters.action,
      })
    }

    if (filters.fromDate) {
      query.andWhere('audit.createdAt >= :fromDate', {
        fromDate: filters.fromDate,
      })
    }

    if (filters.toDate) {
      query.andWhere('audit.createdAt <= :toDate', {
        toDate: `${filters.toDate} 23:59:59`,
      })
    }

    return query.orderBy('audit.createdAt', 'DESC').getMany()
  }
}