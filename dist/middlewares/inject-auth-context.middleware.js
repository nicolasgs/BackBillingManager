"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectAuthContextToBody = injectAuthContextToBody;
function injectAuthContextToBody(req, res, next) {
    if (!req.user?.companyId || !req.user?.id) {
        res.status(401).json({
            success: false,
            code: 'AUTH_CONTEXT_MISSING',
            message: 'Authenticated user context is missing companyId or userId',
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    req.body = {
        ...req.body,
        companyId: req.user.companyId,
        companyPublicId: req.user.companyPublicId ?? null,
        createdBy: req.user.id,
    };
    next();
}
