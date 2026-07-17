"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = ({ res, req, statusCode = 200, code, message, data, }) => {
    return res.status(statusCode).json({
        success: true,
        code,
        message,
        data: data ?? null,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    });
};
exports.sendSuccess = sendSuccess;
