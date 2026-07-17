"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyClosingController = void 0;
const responses_1 = require("../../shared/responses");
const build_auth_context_1 = require("../../shared/utils/build-auth-context");
const monthly_closing_service_1 = require("./monthly-closing.service");
const service = new monthly_closing_service_1.MonthlyClosingService();
class MonthlyClosingController {
    constructor() {
        this.create = async (req, res, next) => {
            try {
                const authContext = (0, build_auth_context_1.buildAuthContext)(req);
                const payload = {
                    ...req.body,
                    companyId: req.user?.companyId,
                    companyPublicId: req.user?.companyPublicId ?? null,
                    createdBy: req.user?.id,
                };
                const closing = await service.create(payload, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    statusCode: 201,
                    code: 'MONTHLY_CLOSING_CREATED',
                    message: 'Monthly closing created successfully',
                    data: closing,
                });
            }
            catch (error) {
                next(error);
            }
        };
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
                const closings = await service.findAll(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'MONTHLY_CLOSINGS_FOUND',
                    message: 'Monthly closings retrieved successfully',
                    data: closings,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.findOne = async (req, res, next) => {
            try {
                const { publicId } = req.params;
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
                const closing = await service.findByPublicId(publicId, companyId);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'MONTHLY_CLOSING_FOUND',
                    message: 'Monthly closing retrieved successfully',
                    data: closing,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.close = async (req, res, next) => {
            try {
                const { publicId } = req.params;
                const companyId = req.user?.companyId;
                const closedBy = req.user?.id;
                const authContext = (0, build_auth_context_1.buildAuthContext)(req);
                if (!companyId || !closedBy) {
                    return res.status(401).json({
                        success: false,
                        code: 'AUTH_CONTEXT_MISSING',
                        message: 'Authenticated company or user context is missing',
                        path: req.originalUrl,
                        timestamp: new Date().toISOString(),
                    });
                }
                const closing = await service.close(publicId, companyId, closedBy, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'MONTHLY_CLOSING_CLOSED',
                    message: 'Monthly closing closed successfully',
                    data: closing,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.reopen = async (req, res, next) => {
            try {
                const { publicId } = req.params;
                const companyId = req.user?.companyId;
                const authContext = (0, build_auth_context_1.buildAuthContext)(req);
                if (!companyId) {
                    return res.status(401).json({
                        success: false,
                        code: 'AUTH_CONTEXT_MISSING',
                        message: 'Company ID was not found in the authenticated user context',
                        path: req.originalUrl,
                        timestamp: new Date().toISOString(),
                    });
                }
                const closing = await service.reopen(publicId, req.body ?? {}, companyId, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'MONTHLY_CLOSING_REOPENED',
                    message: 'Monthly closing reopened successfully',
                    data: closing,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.MonthlyClosingController = MonthlyClosingController;
