"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyMiddleware = void 0;
const env_1 = require("../config/env");
const errors_1 = require("../shared/errors");
const apiKeyMiddleware = (req, _res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== env_1.env.INTERNAL_API_KEY) {
        return next(new errors_1.ApiError(401, 'INVALID_API_KEY', 'Invalid or missing API key'));
    }
    return next();
};
exports.apiKeyMiddleware = apiKeyMiddleware;
