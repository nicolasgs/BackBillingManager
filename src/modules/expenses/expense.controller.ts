import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { ExpenseService } from './expense.service'

const service = new ExpenseService()

export class ExpenseController {
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const expense = await service.create(req.body)

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
        const expenses = await service.findAll(req.query as any)

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

        const expense = await service.findByPublicId(publicId)

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

        const expense = await service.update(publicId, req.body)

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

        const result = await service.softDelete(publicId)

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