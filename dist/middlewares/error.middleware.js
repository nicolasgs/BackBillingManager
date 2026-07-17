"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const typeorm_1 = require("typeorm");
const errors_1 = require("../shared/errors");
const errorMiddleware = (error, req, res, _next) => {
    console.error(error);
    if (error instanceof errors_1.ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            code: error.code,
            message: error.message,
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        });
    }
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: error.issues.map((issue) => issue.message).join(', '),
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        });
    }
    if (error instanceof typeorm_1.QueryFailedError) {
        return res.status(500).json({
            success: false,
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        });
    }
    return res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected server error',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    });
};
exports.errorMiddleware = errorMiddleware;
