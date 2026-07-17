"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCategoryController = void 0;
const responses_1 = require("../../shared/responses");
const build_auth_context_1 = require("../../shared/utils/build-auth-context");
const billing_category_service_1 = require("./billing-category.service");
const service = new billing_category_service_1.BillingCategoryService();
class BillingCategoryController {
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
                const category = await service.create(payload, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    statusCode: 201,
                    code: 'BILLING_CATEGORY_CREATED',
                    message: 'Billing category created successfully',
                    data: category,
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
                const categories = await service.findAll(filters);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'BILLING_CATEGORIES_FOUND',
                    message: 'Billing categories retrieved successfully',
                    data: categories,
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
                const category = await service.findByPublicId(publicId, companyId);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'BILLING_CATEGORY_FOUND',
                    message: 'Billing category retrieved successfully',
                    data: category,
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
                const category = await service.update(publicId, req.body, companyId, authContext);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'BILLING_CATEGORY_UPDATED',
                    message: 'Billing category updated successfully',
                    data: category,
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
                    code: 'BILLING_CATEGORY_DELETED',
                    message: 'Billing category deleted successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.BillingCategoryController = BillingCategoryController;
