import { Request, Response } from 'express'

type ApiResponseParams<T> = {
    res: Response
    req: Request
    statusCode?: number
    code: string
    message: string
    data?: T
}

export const sendSuccess = <T>({
    res,
    req,
    statusCode = 200,
    code,
    message,
    data,
}: ApiResponseParams<T>) => {
    return res.status(statusCode).json({
        success: true,
        code,
        message,
        data: data ?? null,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    })
}