import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { PaymentMethodTypeService } from './payment-method-type.service'

const service = new PaymentMethodTypeService()

export class PaymentMethodTypeController {
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const paymentMethodType = await service.create(req.body)

        return sendSuccess({
            res,
            req,
            statusCode: 201,
            code: 'PAYMENT_METHOD_TYPE_CREATED',
            message: 'Payment method type created successfully',
            data: paymentMethodType,
        })
        } catch (error) {
        next(error)
        }
    }

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const paymentMethodTypes = await service.findAll()

        return sendSuccess({
            res,
            req,
            code: 'PAYMENT_METHOD_TYPES_FOUND',
            message: 'Payment method types retrieved successfully',
            data: paymentMethodTypes,
        })
        } catch (error) {
        next(error)
        }
    }

    findOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { code } = req.params as { code: string }

        const paymentMethodType = await service.findByCode(code.toUpperCase())

        return sendSuccess({
            res,
            req,
            code: 'PAYMENT_METHOD_TYPE_FOUND',
            message: 'Payment method type retrieved successfully',
            data: paymentMethodType,
        })
        } catch (error) {
        next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { code } = req.params as { code: string }

        const paymentMethodType = await service.update(code.toUpperCase(), req.body)

        return sendSuccess({
            res,
            req,
            code: 'PAYMENT_METHOD_TYPE_UPDATED',
            message: 'Payment method type updated successfully',
            data: paymentMethodType,
        })
        } catch (error) {
        next(error)
        }
    }

    remove = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { code } = req.params as { code: string }

        const result = await service.softDelete(code.toUpperCase())

        return sendSuccess({
            res,
            req,
            code: 'PAYMENT_METHOD_TYPE_DELETED',
            message: 'Payment method type deleted successfully',
            data: result,
        })
        } catch (error) {
        next(error)
        }
    }
}