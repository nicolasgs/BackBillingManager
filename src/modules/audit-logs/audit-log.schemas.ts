import { z } from 'zod'
import { AuditAction, AuditEntityType } from '../../shared/enums'

export const listAuditLogsQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
  entityType: z.nativeEnum(AuditEntityType).optional(),
  entityId: z.coerce.number().int().positive().optional(),
  entityPublicId: z.string().uuid().optional(),
  action: z.nativeEnum(AuditAction).optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})