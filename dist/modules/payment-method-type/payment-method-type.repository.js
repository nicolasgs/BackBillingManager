"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodTypeRepository = void 0;
const typeorm_1 = require("typeorm");
const database_1 = require("../../bootstrap/database");
const payment_method_type_entity_1 = require("./payment-method-type.entity");
class PaymentMethodTypeRepository {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(payment_method_type_entity_1.PaymentMethodTypeEntity);
    }
    createEntity(payload) {
        return this.repository.create(payload);
    }
    save(paymentMethodType) {
        return this.repository.save(paymentMethodType);
    }
    findAll() {
        return this.repository.find({
            where: {
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            order: {
                code: 'ASC',
            },
        });
    }
    findByCode(code) {
        return this.repository.findOne({
            where: {
                code,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    softDeleteByCode(code) {
        return this.repository.softDelete(code);
    }
}
exports.PaymentMethodTypeRepository = PaymentMethodTypeRepository;
