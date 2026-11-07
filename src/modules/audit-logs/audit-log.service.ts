import { EntityManager } from 'typeorm'
import { CreateAuditLogDto } from './dto/audit-log.dto'
import { AuditLogRepository } from './audit-log.repository'
import { AuditLogFilters } from './interfaces/audit-log-filters.interface'

export class AuditLogService {
  constructor(
    private readonly repository = new AuditLogRepository()
  ) {}

  async log(
    payload: CreateAuditLogDto,
    manager?: EntityManager
  ) {
    const ctx = payload.authContext

    const log = this.repository.createEntity(
      {
        companyId: payload.companyId,
        companyPublicId:
          payload.companyPublicId ??
          ctx?.companyPublicId ??
          null,

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
      },
      manager
    )

    return this.repository.save(
      log,
      manager
    )
  }

  async findAll(filters: AuditLogFilters) {
    return this.repository.findAll(filters)
  }
}
