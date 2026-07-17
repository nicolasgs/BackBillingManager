import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { ReportFilters } from './interfaces/report-filters.interface'
import { ReportsService } from './reports.service'

const service = new ReportsService()

export class ReportsController {
  private buildFilters(req: Request): ReportFilters | null {
    const companyId = req.user?.companyId

    if (!companyId) {
      return null
    }

    const queryFilters = req.query as unknown as Omit<
      ReportFilters,
      'companyId' | 'companyPublicId'
    >

    return {
      ...queryFilters,
      companyId,
      companyPublicId: req.user?.companyPublicId ?? null,
    }
  }

  profitLoss = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message:
            'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const result = await service.getProfitLoss(filters)

      return sendSuccess({
        res,
        req,
        code: 'PROFIT_LOSS_REPORT_FOUND',
        message: 'Profit and loss report retrieved successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  exportIncomes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message:
            'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const csv = await service.exportIncomesCsv(filters)

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="incomes-report.csv"'
      )

      return res.status(200).send(csv)
    } catch (error) {
      next(error)
    }
  }

  exportExpenses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = this.buildFilters(req)

      if (!filters) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message:
            'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const csv = await service.exportExpensesCsv(filters)

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="expenses-report.csv"'
      )

      return res.status(200).send(csv)
    } catch (error) {
      next(error)
    }
  }
}