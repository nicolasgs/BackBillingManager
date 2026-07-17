"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const errors_1 = require("../shared/errors");
const validate = (schema, target = 'body') => (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
        const message = result.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', ');
        return next(new errors_1.ApiError(400, 'VALIDATION_ERROR', message));
    }
    if (target === 'body') {
        req.body = result.data;
    }
    return next();
};
exports.validate = validate;
