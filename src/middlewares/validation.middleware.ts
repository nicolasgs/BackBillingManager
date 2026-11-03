import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'
import { ApiError } from '../shared/errors'

type ValidationTarget = 'body' | 'query' | 'params'

export const validate =
    (schema: ZodSchema, target: ValidationTarget = 'body') =>
    (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[target])

        if (!result.success) {
        const message = result.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', ')

        return next(new ApiError(400, 'VALIDATION_ERROR', message))
        }

        if (target === 'body') {
        req.body = result.data
        }

        if (target === 'params') {
        req.params = result.data as Request['params']
        }

        if (target === 'query') {
        Object.defineProperty(req, 'query', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: result.data,
        })
        }

        return next()
}
