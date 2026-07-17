import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { DashboardFilters } from './interfaces/dashboard-filters.interface'
import { DashboardService } from './dashboard.service'

const service = new DashboardService()

export class DashboardController {
  private buildFilters(req: Request): DashboardFilters | null {
    const companyId = req.user?.companyId

    if (!companyId) {
      return null
    }

    const queryFilters = req.query as unknown as Omit<
      DashboardFilters,
      'companyId' | 'companyPublicId'
    >

    return {
      ...queryFilters,
      companyId,
      companyPublicId: req.user?.companyPublicId ?? null,
    }
  }

  private sendMissingContext(req: Request, res: Response) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_CONTEXT_MISSING',
      message: 'Company ID was not found in the authenticated user context',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    })
  }

  summary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return this.sendMissingContext(req, res)
      }

      const summary = await service.getSummary(filters)

      return sendSuccess({
        res,
        req,
        code: 'DASHBOARD_SUMMARY_FOUND',
        message: 'Dashboard summary retrieved successfully',
        data: summary,
      })
    } catch (error) {
      next(error)
    }
  }

  byCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return this.sendMissingContext(req, res)
      }

      const result = await service.getByCategory(filters)

      return sendSuccess({
        res,
        req,
        code: 'DASHBOARD_BY_CATEGORY_FOUND',
        message: 'Dashboard category summary retrieved successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  monthlyTrend = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return this.sendMissingContext(req, res)
      }

      const result = await service.getMonthlyTrend(filters)

      return sendSuccess({
        res,
        req,
        code: 'DASHBOARD_MONTHLY_TREND_FOUND',
        message: 'Dashboard monthly trend retrieved successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  topVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return this.sendMissingContext(req, res)
      }

      const result = await service.getTopVendors(filters)

      return sendSuccess({
        res,
        req,
        code: 'DASHBOARD_TOP_VENDORS_FOUND',
        message: 'Dashboard top vendors retrieved successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  topIncomeCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return this.sendMissingContext(req, res)
      }

      const result = await service.getTopIncomeCategories(filters)

      return sendSuccess({
        res,
        req,
        code: 'DASHBOARD_TOP_INCOME_CATEGORIES_FOUND',
        message: 'Dashboard top income categories retrieved successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  topExpenseCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return this.sendMissingContext(req, res)
      }

      const result = await service.getTopExpenseCategories(filters)

      return sendSuccess({
        res,
        req,
        code: 'DASHBOARD_TOP_EXPENSE_CATEGORIES_FOUND',
        message: 'Dashboard top expense categories retrieved successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}