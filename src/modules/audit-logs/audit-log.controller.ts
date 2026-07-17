import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { AuditLogService } from './audit-log.service'
import { AuditLogFilters } from './interfaces/audit-log-filters.interface'

const service = new AuditLogService()

export class AuditLogController {
  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message: 'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const queryFilters = req.query as unknown as Omit<
        AuditLogFilters,
        'companyId'
      >

      const filters: AuditLogFilters = {
        ...queryFilters,
        companyId,
      }

      const logs = await service.findAll(filters)

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