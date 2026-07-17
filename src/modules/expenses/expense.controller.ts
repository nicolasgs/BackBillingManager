import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { buildAuthContext } from '../../shared/utils/build-auth-context'
import { ExpenseFilters } from './interfaces/expense-filters.interface'
import { ExpenseService } from './expense.service'

const service = new ExpenseService()

export class ExpenseController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authContext = buildAuthContext(req)

      const payload = {
        ...req.body,
        companyId: req.user?.companyId,
        companyPublicId: req.user?.companyPublicId ?? null,
        createdBy: req.user?.id,
      }

      // Aquí debes enviar payload, no req.body.
      const expense = await service.create(payload, authContext)

      return sendSuccess({
        res,
        req,
        statusCode: 201,
        code: 'EXPENSE_CREATED',
        message: 'Expense created successfully',
        data: expense,
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
        ExpenseFilters,
        'companyId'
      >

      const filters: ExpenseFilters = {
        ...queryFilters,
        companyId,
        companyPublicId: req.user?.companyPublicId ?? null,
      }

      const expenses = await service.findAll(filters)

      return sendSuccess({
        res,
        req,
        code: 'EXPENSES_FOUND',
        message: 'Expenses retrieved successfully',
        data: expenses,
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

      const expense = await service.findByPublicId(publicId, companyId)

      return sendSuccess({
        res,
        req,
        code: 'EXPENSE_FOUND',
        message: 'Expense retrieved successfully',
        data: expense,
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

      const expense = await service.update(
        publicId,
        req.body,
        companyId,
        authContext
      )

      return sendSuccess({
        res,
        req,
        code: 'EXPENSE_UPDATED',
        message: 'Expense updated successfully',
        data: expense,
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
        code: 'EXPENSE_DELETED',
        message: 'Expense deleted successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}