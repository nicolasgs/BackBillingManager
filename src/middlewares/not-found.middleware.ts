import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../shared/errors'

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(
    new ApiError(
      404,
      'ROUTE_NOT_FOUND',
      `Route ${req.method} ${req.originalUrl} not found`
    )
  )
}