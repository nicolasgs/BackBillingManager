import { AuditAction, AuditEntityType } from '../../../shared/enums'

export interface AuditLogFilters {
  companyId: number

  entityType?: AuditEntityType

  entityId?: number

  entityPublicId?: string

  action?: AuditAction

  fromDate?: string

  toDate?: string
}