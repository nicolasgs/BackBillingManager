import { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '../../shared/responses'
import { buildAuthContext } from '../../shared/utils/build-auth-context'
import { BillingCategoryFilters } from './interfaces/billing-category-filters.interface'
import { BillingCategoryService } from './billing-category.service'

const service = new BillingCategoryService()

export class BillingCategoryController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authContext = buildAuthContext(req)

      const payload = {
        ...req.body,
        companyId: req.user?.companyId,
        companyPublicId: req.user?.companyPublicId ?? null,
        createdBy: req.user?.id,
      }

      const category = await service.create(payload, authContext)

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
        BillingCategoryFilters,
        'companyId'
      >

      const filters: BillingCategoryFilters = {
        ...queryFilters,
        companyId,
        companyPublicId: req.user?.companyPublicId,
      }

      const categories = await service.findAll(filters)

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

      const category = await service.findByPublicId(publicId, companyId)

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

      const category = await service.update(
        publicId,
        req.body,
        companyId,
        authContext
      )

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
        code: 'BILLING_CATEGORY_DELETED',
        message: 'Billing category deleted successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}