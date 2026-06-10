import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../../shared/responses'
import { BillingCategoryService } from './billing-category.service'

const service = new BillingCategoryService()

export class BillingCategoryController {
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const category = await service.create(req.body)

        return sendSuccess({
            res,
            req,
            statusCode: 201,
            code: 'BILLING_CATEGORY_CREATED',
            message: 'Billing category created successfully',
            data: category,
        })
        } catch (error) {
        next(error)
        }
    }

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const categories = await service.findAll(req.query as any)

        return sendSuccess({
            res,
            req,
            code: 'BILLING_CATEGORIES_FOUND',
            message: 'Billing categories retrieved successfully',
            data: categories,
        })
        } catch (error) {
        next(error)
        }
    }

    findOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { publicId } = req.params as { publicId: string }

        const category = await service.findByPublicId(publicId)

        return sendSuccess({
            res,
            req,
            code: 'BILLING_CATEGORY_FOUND',
            message: 'Billing category retrieved successfully',
            data: category,
        })
        } catch (error) {
        next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { publicId } = req.params as { publicId: string }

        const category = await service.update(publicId, req.body)

        return sendSuccess({
            res,
            req,
            code: 'BILLING_CATEGORY_UPDATED',
            message: 'Billing category updated successfully',
            data: category,
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
            code: 'BILLING_CATEGORY_DELETED',
            message: 'Billing category deleted successfully',
            data: result,
        })
        } catch (error) {
        next(error)
        }
    }
}