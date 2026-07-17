"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeController = void 0;
const responses_1 = require("../../shared/responses");
const build_auth_context_1 = require("../../shared/utils/build-auth-context");
const income_service_1 = require("./income.service");
const service = new income_service_1.IncomeService();
class IncomeController {
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
                const income = await service.create(payload, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    statusCode: 201,
                    code: 'INCOME_CREATED',
                    message: 'Income created successfully',
                    data: income,
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
                    companyPublicId: req.user?.companyPublicId,
                };
                const incomes = await service.findAll(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'INCOMES_FOUND',
                    message: 'Incomes retrieved successfully',
                    data: incomes,
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
                const income = await service.findByPublicId(publicId, companyId);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'INCOME_FOUND',
                    message: 'Income retrieved successfully',
                    data: income,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
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
                const income = await service.update(publicId, req.body, companyId, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'INCOME_UPDATED',
                    message: 'Income updated successfully',
                    data: income,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.remove = async (req, res, next) => {
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
                const result = await service.softDelete(publicId, companyId, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'INCOME_DELETED',
                    message: 'Income deleted successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.IncomeController = IncomeController;
