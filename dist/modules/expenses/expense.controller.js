"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const responses_1 = require("../../shared/responses");
const build_auth_context_1 = require("../../shared/utils/build-auth-context");
const expense_service_1 = require("./expense.service");
const service = new expense_service_1.ExpenseService();
class ExpenseController {
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
                // Aquí debes enviar payload, no req.body.
                const expense = await service.create(payload, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    statusCode: 201,
                    code: 'EXPENSE_CREATED',
                    message: 'Expense created successfully',
                    data: expense,
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
                    companyPublicId: req.user?.companyPublicId ?? null,
                };
                const expenses = await service.findAll(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'EXPENSES_FOUND',
                    message: 'Expenses retrieved successfully',
                    data: expenses,
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
                const expense = await service.findByPublicId(publicId, companyId);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'EXPENSE_FOUND',
                    message: 'Expense retrieved successfully',
                    data: expense,
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
                const expense = await service.update(publicId, req.body, companyId, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'EXPENSE_UPDATED',
                    message: 'Expense updated successfully',
                    data: expense,
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
                    code: 'EXPENSE_DELETED',
                    message: 'Expense deleted successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ExpenseController = ExpenseController;
