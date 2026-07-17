"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const responses_1 = require("../../shared/responses");
const audit_log_service_1 = require("./audit-log.service");
const service = new audit_log_service_1.AuditLogService();
class AuditLogController {
    constructor() {
        this.findAll = async (req, res, next) => {
            try {
                const companyId = req.user?.companyId;
                if (!companyId) {
                    return res.status(401).json({
                        success: false,
                        code: 'AUTH_CONTEXT_MISSING',
                        message: 'Company ID was not found in the authenticated user context',
                        path: req.originalUrl,
                        timestamp: new Date().toISOString(),
                    });
                }
                const queryFilters = req.query;
                const filters = {
                    ...queryFilters,
                    companyId,
                };
                const logs = await service.findAll(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'AUDIT_LOGS_FOUND',
                    message: 'Audit logs retrieved successfully',
                    data: logs,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuditLogController = AuditLogController;
