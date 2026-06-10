import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { QueryFailedError } from 'typeorm'
import { ApiError } from '../shared/errors'

export const errorMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
    ) => {
    console.error(error)

    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        })
    }

    if (error instanceof ZodError) {
        return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: error.issues.map((issue) => issue.message).join(', '),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        })
    }

    if (error instanceof QueryFailedError) {
        return res.status(500).json({
        success: false,
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        })
    }

    return res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected server error',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    })
}