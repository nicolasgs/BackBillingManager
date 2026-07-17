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
        const code = payload.code.trim().toUpperCase();
        const existing = await this.repository.findByCodeIncludingDeleted(code);
        if (existing && !existing.deletedAt) {
            throw new errors_1.ApiError(409, 'PAYMENT_METHOD_TYPE_ALREADY_EXISTS', 'Payment method type already exists');
        }
        if (existing?.deletedAt) {
            await this.repository.restoreByCode(code);
            existing.description = payload.description.trim();
            existing.deletedAt = null;
            return this.repository.save(existing);
        }
        const paymentMethodType = this.repository.createEntity({
            code,
            description: payload.description.trim(),
        });
        return this.repository.save(paymentMethodType);
    }
    async findAll() {
        return this.repository.findAll();
    }
    async findByCode(code) {
        const normalizedCode = code.trim().toUpperCase();
        const paymentMethodType = await this.repository.findByCode(normalizedCode);
        if (!paymentMethodType) {
            throw new errors_1.ApiError(404, 'PAYMENT_METHOD_TYPE_NOT_FOUND', 'Payment method type not found');
        }
        return paymentMethodType;
    }
    async update(code, payload) {
        const paymentMethodType = await this.findByCode(code);
        if (payload.description !== undefined) {
            paymentMethodType.description = payload.description.trim();
        }
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
