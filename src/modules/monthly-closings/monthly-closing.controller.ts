import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { buildAuthContext } from '../../shared/utils/build-auth-context'
import { MonthlyClosingFilters } from './interfaces/monthly-closing-filters.interface'
import { MonthlyClosingService } from './monthly-closing.service'

const service = new MonthlyClosingService()

export class MonthlyClosingController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authContext = buildAuthContext(req)

      const payload = {
        ...req.body,
        companyId: req.user?.companyId,
        companyPublicId: req.user?.companyPublicId ?? null,
        createdBy: req.user?.id,
      }

      const closing = await service.create(payload, authContext)

      return sendSuccess({
        res,
        req,
        statusCode: 201,
        code: 'MONTHLY_CLOSING_CREATED',
        message: 'Monthly closing created successfully',
        data: closing,
      })
    } catch (error) {
      next(error)
    }
  }

  findAll = async (req: Request, res: Response, next: NextFunction) => {
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
        MonthlyClosingFilters,
        'companyId'
      >

      const filters: MonthlyClosingFilters = {
        ...queryFilters,
        companyId,
      }

      const closings = await service.findAll(filters)

      return sendSuccess({
        res,
        req,
        code: 'MONTHLY_CLOSINGS_FOUND',
        message: 'Monthly closings retrieved successfully',
        data: closings,
      })
    } catch (error) {
      next(error)
    }
  }

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params as { publicId: string }
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

      const closing = await service.findByPublicId(publicId, companyId)

      return sendSuccess({
        res,
        req,
        code: 'MONTHLY_CLOSING_FOUND',
        message: 'Monthly closing retrieved successfully',
        data: closing,
      })
    } catch (error) {
      next(error)
    }
  }

  close = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params as { publicId: string }
      const companyId = req.user?.companyId
      const closedBy = req.user?.id
      const authContext = buildAuthContext(req)

      if (!companyId || !closedBy) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message: 'Authenticated company or user context is missing',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const closing = await service.close(
        publicId,
        companyId,
        closedBy,
        authContext
      )

      return sendSuccess({
        res,
        req,
        code: 'MONTHLY_CLOSING_CLOSED',
        message: 'Monthly closing closed successfully',
        data: closing,
      })
    } catch (error) {
      next(error)
    }
  }

  reopen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params as { publicId: string }
      const companyId = req.user?.companyId
      const authContext = buildAuthContext(req)

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message: 'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const closing = await service.reopen(
        publicId,
        req.body ?? {},
        companyId,
        authContext
      )

      return sendSuccess({
        res,
        req,
        code: 'MONTHLY_CLOSING_REOPENED',
        message: 'Monthly closing reopened successfully',
        data: closing,
      })
    } catch (error) {
      next(error)
    }
  }
}