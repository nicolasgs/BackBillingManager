import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { VendorService } from './vendor.service'

const service = new VendorService()

export class VendorController {
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const vendor = await service.create(req.body)

        return sendSuccess({
            res,
            req,
            statusCode: 201,
            code: 'VENDOR_CREATED',
            message: 'Vendor created successfully',
            data: vendor,
        })
        } catch (error) {
        next(error)
        }
    }

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const vendors = await service.findAll(req.query as any)

        return sendSuccess({
            res,
            req,
            code: 'VENDORS_FOUND',
            message: 'Vendors retrieved successfully',
            data: vendors,
        })
        } catch (error) {
        next(error)
        }
    }

    findOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { publicId } = req.params as { publicId: string }

        const vendor = await service.findByPublicId(publicId)

        return sendSuccess({
            res,
            req,
            code: 'VENDOR_FOUND',
            message: 'Vendor retrieved successfully',
            data: vendor,
        })
        } catch (error) {
        next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { publicId } = req.params as { publicId: string }

        const vendor = await service.update(publicId, req.body)

        return sendSuccess({
            res,
            req,
            code: 'VENDOR_UPDATED',
            message: 'Vendor updated successfully',
            data: vendor,
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
            code: 'VENDOR_DELETED',
            message: 'Vendor deleted successfully',
            data: result,
        })
        } catch (error) {
        next(error)
        }
    }
}