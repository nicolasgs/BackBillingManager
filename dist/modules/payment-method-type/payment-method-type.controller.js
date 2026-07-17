"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodTypeController = void 0;
const responses_1 = require("../../shared/responses");
const payment_method_type_service_1 = require("./payment-method-type.service");
const service = new payment_method_type_service_1.PaymentMethodTypeService();
class PaymentMethodTypeController {
    constructor() {
        this.create = async (req, res, next) => {
            try {
                const paymentMethodType = await service.create(req.body);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    statusCode: 201,
                    code: 'PAYMENT_METHOD_TYPE_CREATED',
                    message: 'Payment method type created successfully',
                    data: paymentMethodType,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.findAll = async (req, res, next) => {
            try {
                const paymentMethodTypes = await service.findAll();
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'PAYMENT_METHOD_TYPES_FOUND',
                    message: 'Payment method types retrieved successfully',
                    data: paymentMethodTypes,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.findOne = async (req, res, next) => {
            try {
                const { code } = req.params;
                const paymentMethodType = await service.findByCode(code.toUpperCase());
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'PAYMENT_METHOD_TYPE_FOUND',
                    message: 'Payment method type retrieved successfully',
                    data: paymentMethodType,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const { code } = req.params;
                const paymentMethodType = await service.update(code.toUpperCase(), req.body);
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'PAYMENT_METHOD_TYPE_UPDATED',
                    message: 'Payment method type updated successfully',
                    data: paymentMethodType,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.remove = async (req, res, next) => {
            try {
                const { code } = req.params;
                const result = await service.softDelete(code.toUpperCase());
                return (0, responses_1.sendSuccess)({
                    res,
                    req,
                    code: 'PAYMENT_METHOD_TYPE_DELETED',
                    message: 'Payment method type deleted successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.PaymentMethodTypeController = PaymentMethodTypeController;
