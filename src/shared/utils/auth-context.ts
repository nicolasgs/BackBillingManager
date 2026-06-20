import { Request } from 'express'

export function buildAuthContext(req: Request) {
  return {
    userId: req.user?.id,
    userEmail: req.user?.email,

    username:
      `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`
        .trim() || undefined,

    userRole: req.user?.roles?.[0],

    companyId: req.user?.companyId,
    companyPublicId: req.user?.companyPublicId,

    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  }
}