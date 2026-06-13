import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { AuditLogService } from './audit-log.service'

const service = new AuditLogService()

export class AuditLogController {
  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await service.findAll(req.query as any)

      return sendSuccess({
        res,
        req,
        code: 'AUDIT_LOGS_FOUND',
        message: 'Audit logs retrieved successfully',
        data: logs,
      })
    } catch (error) {
      next(error)
    }
  }
}