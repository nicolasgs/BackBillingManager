import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { MonthlyClosingService } from './monthly-closing.service'

const service = new MonthlyClosingService()

export class MonthlyClosingController {
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const closing = await service.create(req.body)

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
        const closings = await service.findAll(req.query as any)

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

        const closing = await service.findByPublicId(publicId)

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

        const closing = await service.close(publicId, req.body)

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

        const closing = await service.reopen(publicId, req.body)

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