"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuthContext = buildAuthContext;
function buildAuthContext(req) {
    return {
        companyId: req.user?.companyId,
        companyPublicId: req.user?.companyPublicId ?? null,
        userId: req.user?.id,
        userEmail: req.user?.email,
        username: `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() ||
            undefined,
        userRole: req.user?.roles?.[0],
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? null,
    };
}
