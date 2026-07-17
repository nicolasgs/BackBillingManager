import { Request } from 'express'
import { AuthContext } from '../../modules/audit-logs/interfaces/auth-context.interface'

export function buildAuthContext(req: Request): AuthContext {
  return {
    companyId: req.user?.companyId,
    companyPublicId: req.user?.companyPublicId ?? null,
    userId: req.user?.id,
    userEmail: req.user?.email,
    username:
      `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() ||
      undefined,
    userRole: req.user?.roles?.[0],
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] ?? null,
  }
}