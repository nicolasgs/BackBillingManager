"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodTypeService = void 0;
const errors_1 = require("../../shared/errors");
const payment_method_type_repository_1 = require("./payment-method-type.repository");
class PaymentMethodTypeService {
    constructor(repository = new payment_method_type_repository_1.PaymentMethodTypeRepository()) {
        this.repository = repository;
    }
    async create(payload) {
        const existing = await this.repository.findByCode(payload.code);
        if (existing) {
            throw new errors_1.ApiError(409, 'PAYMENT_METHOD_TYPE_ALREADY_EXISTS', 'Payment method type already exists');
        }
        const paymentMethodType = this.repository.createEntity(payload);
        return this.repository.save(paymentMethodType);
    }
    async findAll() {
        return this.repository.findAll();
    }
    async findByCode(code) {
        const paymentMethodType = await this.repository.findByCode(code);
        if (!paymentMethodType) {
            throw new errors_1.ApiError(404, 'PAYMENT_METHOD_TYPE_NOT_FOUND', 'Payment method type not found');
        }
        return paymentMethodType;
    }
    async update(code, payload) {
        const paymentMethodType = await this.findByCode(code);
        Object.assign(paymentMethodType, payload);
        return this.repository.save(paymentMethodType);
    }
    async softDelete(code) {
        const paymentMethodType = await this.findByCode(code);
        await this.repository.softDeleteByCode(paymentMethodType.code);
        return {
            code: paymentMethodType.code,
            deleted: true,
        };
    }
}
exports.PaymentMethodTypeService = PaymentMethodTypeService;
