import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { buildAuthContext } from '../../shared/utils/build-auth-context'
import { VendorFilters } from './interfaces/vendor-filters.interface'
import { VendorService } from './vendor.service'

const service = new VendorService()

export class VendorController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authContext = buildAuthContext(req)

      const payload = {
        ...req.body,
        companyId: req.user?.companyId,
        companyPublicId: req.user?.companyPublicId ?? null,
        createdBy: req.user?.id,
      }

      const vendor = await service.create(payload, authContext)

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
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message: 'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const queryFilters = req.query as unknown as Omit<
        VendorFilters,
        'companyId'
      >

      const filters: VendorFilters = {
        ...queryFilters,
        companyId,
        companyPublicId: req.user?.companyPublicId ?? null,
      }

      const vendors = await service.findAll(filters)

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
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message: 'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const vendor = await service.findByPublicId(publicId, companyId)

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
      const companyId = req.user?.companyId
      const authContext = buildAuthContext(req)

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message: 'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const vendor = await service.update(
        publicId,
        req.body,
        companyId,
        authContext
      )

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
      const companyId = req.user?.companyId
      const authContext = buildAuthContext(req)

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_CONTEXT_MISSING',
          message: 'Company ID was not found in the authenticated user context',
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        })
      }

      const result = await service.softDelete(
        publicId,
        companyId,
        authContext
      )

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