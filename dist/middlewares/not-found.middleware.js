"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const errors_1 = require("../shared/errors");
const notFoundMiddleware = (req, _res, next) => {
    next(new errors_1.ApiError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
};
exports.notFoundMiddleware = notFoundMiddleware;
