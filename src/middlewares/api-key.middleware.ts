import { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'
import { ApiError } from '../shared/errors'

export const apiKeyMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
    ) => {
    const apiKey = req.headers['x-api-key']

    if (!apiKey || apiKey !== env.INTERNAL_API_KEY) {
        return next(new ApiError(401, 'INVALID_API_KEY', 'Invalid or missing API key'))
    }

    return next()
}