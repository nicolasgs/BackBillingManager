import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { buildAuthContext } from '../../shared/utils/build-auth-context'
import { IncomeFilters } from './interfaces/income-filters.interface'
import { IncomeService } from './income.service'

const service = new IncomeService()

export class IncomeController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authContext = buildAuthContext(req)

      const payload = {
        ...req.body,
        companyId: req.user?.companyId,
        companyPublicId: req.user?.companyPublicId ?? null,
        createdBy: req.user?.id,
      }

      const income = await service.create(payload, authContext)

      return sendSuccess({
        res,
        req,
        statusCode: 201,
        code: 'INCOME_CREATED',
        message: 'Income created successfully',
        data: income,
      })
    } catch (error) {
      next(error)
    }
  }

  createFromCrmPayment = async (
      req: Request,
      res: Response,
      next: NextFunction,
  ) => {
      try {
          const companyId =
              req.user?.companyId

          if (!companyId) {
              return res
                  .status(401)
                  .json({
                      success: false,
                      code:
                          'AUTH_CONTEXT_MISSING',
                      message:
                          'Company ID was not found in the authenticated user context',
                      path:
                          req.originalUrl,
                      timestamp:
                          new Date()
                              .toISOString(),
                  })
          }

          const authContext =
              buildAuthContext(req)

          const income =
              await service
                  .createFromCrmPayment(
                      {
                          ...req.body,

                          companyId,

                          companyPublicId:
                              req.user
                                  ?.companyPublicId ??
                              null,

                          createdBy:
                              req.user?.id,
                      },

                      authContext,
                  )

          return sendSuccess({
              res,
              req,
              statusCode: 201,
              code:
                  'CRM_PAYMENT_INCOME_RECORDED',
              message:
                  'CRM payment income recorded successfully',
              data:
                  income,
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
        IncomeFilters,
        'companyId'
      >

      const filters: IncomeFilters = {
        ...queryFilters,
        companyId,
        companyPublicId: req.user?.companyPublicId,
      }

      const incomes = await service.findAll(filters)

      return sendSuccess({
        res,
        req,
        code: 'INCOMES_FOUND',
        message: 'Incomes retrieved successfully',
        data: incomes,
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

      const income = await service.findByPublicId(publicId, companyId)

      return sendSuccess({
        res,
        req,
        code: 'INCOME_FOUND',
        message: 'Income retrieved successfully',
        data: income,
      })
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
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

      const income = await service.update(
        publicId,
        req.body,
        companyId,
        authContext
      )

      return sendSuccess({
        res,
        req,
        code: 'INCOME_UPDATED',
        message: 'Income updated successfully',
        data: income,
      })
    } catch (error) {
      next(error)
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await service.softDelete(
        publicId,
        companyId,
        authContext
      )

      return sendSuccess({
        res,
        req,
        code: 'INCOME_DELETED',
        message: 'Income deleted successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}