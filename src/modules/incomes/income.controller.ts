import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { IncomeService } from './income.service'

const service = new IncomeService()

export class IncomeController {
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const user = req.user

        const payload = {
        ...req.body,
        companyId: user?.companyId,
        companyPublicId: user?.companyPublicId ?? null,
        createdBy: user?.id,
        }

        const income = await service.create(payload)

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

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const user = req.user

        const filters = {
        ...req.query,
        companyId: user?.companyId,
        companyPublicId: user?.companyPublicId ?? undefined,
        }

        const incomes = await service.findAll(filters as any)

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

        const income = await service.findByPublicId(publicId)

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

        const income = await service.update(publicId, req.body)

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

        const result = await service.softDelete(publicId)

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