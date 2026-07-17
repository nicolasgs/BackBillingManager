"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const responses_1 = require("../../shared/responses");
const reports_service_1 = require("./reports.service");
const service = new reports_service_1.ReportsService();
class ReportsController {
    constructor() {
        this.profitLoss = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return res.status(401).json({
                        success: false,
                        code: 'AUTH_CONTEXT_MISSING',
                        message: 'Company ID was not found in the authenticated user context',
                        path: req.originalUrl,
                        timestamp: new Date().toISOString(),
                    });
                }
                const result = await service.getProfitLoss(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'PROFIT_LOSS_REPORT_FOUND',
                    message: 'Profit and loss report retrieved successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.exportIncomes = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return res.status(401).json({
                        success: false,
                        code: 'AUTH_CONTEXT_MISSING',
                        message: 'Company ID was not found in the authenticated user context',
                        path: req.originalUrl,
                        timestamp: new Date().toISOString(),
                    });
                }
                const csv = await service.exportIncomesCsv(filters);
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', 'attachment; filename="incomes-report.csv"');
                return res.status(200).send(csv);
            }
            catch (error) {
                next(error);
            }
        };
        this.exportExpenses = async (req, res, next) => {
            try {
                const filters = this.buildFilters(req);
                if (!filters) {
                    return res.status(401).json({
                        success: false,
                        code: 'AUTH_CONTEXT_MISSING',
                        message: 'Company ID was not found in the authenticated user context',
                        path: req.originalUrl,
                        timestamp: new Date().toISOString(),
                    });
                }
                const csv = await service.exportExpensesCsv(filters);
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', 'attachment; filename="expenses-report.csv"');
                return res.status(200).send(csv);
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
}
exports.ReportsController = ReportsController;
