"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const responses_1 = require("../../shared/responses");
const dashboard_service_1 = require("./dashboard.service");
const service = new dashboard_service_1.DashboardService();
class DashboardController {
    constructor() {
        this.summary = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return this.sendMissingContext(req, res);
                }
                const summary = await service.getSummary(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'DASHBOARD_SUMMARY_FOUND',
                    message: 'Dashboard summary retrieved successfully',
                    data: summary,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.byCategory = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return this.sendMissingContext(req, res);
                }
                const result = await service.getByCategory(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'DASHBOARD_BY_CATEGORY_FOUND',
                    message: 'Dashboard category summary retrieved successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.monthlyTrend = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return this.sendMissingContext(req, res);
                }
                const result = await service.getMonthlyTrend(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'DASHBOARD_MONTHLY_TREND_FOUND',
                    message: 'Dashboard monthly trend retrieved successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.topVendors = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return this.sendMissingContext(req, res);
                }
                const result = await service.getTopVendors(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'DASHBOARD_TOP_VENDORS_FOUND',
                    message: 'Dashboard top vendors retrieved successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.topIncomeCategories = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return this.sendMissingContext(req, res);
                }
                const result = await service.getTopIncomeCategories(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'DASHBOARD_TOP_INCOME_CATEGORIES_FOUND',
                    message: 'Dashboard top income categories retrieved successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.topExpenseCategories = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return this.sendMissingContext(req, res);
                }
                const result = await service.getTopExpenseCategories(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'DASHBOARD_TOP_EXPENSE_CATEGORIES_FOUND',
                    message: 'Dashboard top expense categories retrieved successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
    buildFilters(req) {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return null;
        }
        const queryFilters = req.query;
        return {
            ...queryFilters,
            companyId,
            companyPublicId: req.user?.companyPublicId ?? null,
        };
    }
    sendMissingContext(req, res) {
        return res.status(401).json({
            success: false,
            code: 'AUTH_CONTEXT_MISSING',
            message: 'Company ID was not found in the authenticated user context',
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.DashboardController = DashboardController;
