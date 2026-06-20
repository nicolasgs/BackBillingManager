import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { ReportsService } from './reports.service'

const service = new ReportsService()

export class ReportsController {
  profitLoss = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.getProfitLoss(req.query as any)

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

  exportIncomes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const csv = await service.exportIncomesCsv(req.query as any)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="incomes-report.csv"'
      )

      return res.status(200).send(csv)
    } catch (error) {
      next(error)
    }
  }

  exportExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const csv = await service.exportExpensesCsv(req.query as any)

      res.setHeader('Content-Type', 'text/csv')
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