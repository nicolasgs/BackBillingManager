import { AuditAction, AuditEntityType } from '../../../shared/enums'
import { AuthContext } from '../interfaces/auth-context.interface'

export interface CreateAuditLogDto {
  companyId: number
  companyPublicId?: string | null

  entityType: AuditEntityType
  entityId?: number | null
  entityPublicId?: string | null

  action: AuditAction

  oldValues?: any
  newValues?: any

  authContext?: AuthContext
}