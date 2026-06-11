import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { DashboardService } from './dashboard.service'

const service = new DashboardService()

export class DashboardController {
    summary = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const summary = await service.getSummary(req.query as any)

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
        const result = await service.getByCategory(req.query as any)

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

    monthlyTrend = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await service.getMonthlyTrend(req.query as any)

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
            const result = await service.getTopVendors(req.query as any)

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
            const result = await service.getTopIncomeCategories(req.query as any)

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
            const result = await service.getTopExpenseCategories(req.query as any)

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