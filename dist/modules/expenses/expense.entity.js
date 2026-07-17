"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/entities/base.entity");
const enums_1 = require("../../shared/enums");
const billing_category_entity_1 = require("../billing-categories/billing-category.entity");
const payment_method_type_entity_1 = require("../payment-method-type/payment-method-type.entity");
const vendor_entity_1 = require("../vendors/vendor.entity");
let ExpenseEntity = class ExpenseEntity extends base_entity_1.BaseEntity {
};
exports.ExpenseEntity = ExpenseEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], ExpenseEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_public_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "companyPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.VendorEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_public_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "vendorPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_name', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "vendorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], ExpenseEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD' }),
    __metadata("design:type", String)
], ExpenseEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_date', type: 'date' }),
    __metadata("design:type", String)
], ExpenseEntity.prototype, "expenseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id', type: 'int' }),
    __metadata("design:type", Number)
], ExpenseEntity.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => billing_category_entity_1.BillingCategoryEntity),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", billing_category_entity_1.BillingCategoryEntity)
], ExpenseEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method_code', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], ExpenseEntity.prototype, "paymentMethodCode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_method_type_entity_1.PaymentMethodTypeEntity),
    (0, typeorm_1.JoinColumn)({ name: 'payment_method_code', referencedColumnName: 'code' }),
    __metadata("design:type", payment_method_type_entity_1.PaymentMethodTypeEntity)
], ExpenseEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.TransactionStatus, default: enums_1.TransactionStatus.PAID }),
    __metadata("design:type", String)
], ExpenseEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.TransactionSource, default: enums_1.TransactionSource.MANUAL }),
    __metadata("design:type", String)
], ExpenseEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_provider', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "externalProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_transaction_id', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", Object)
], ExpenseEntity.prototype, "externalTransactionId", void 0);
exports.ExpenseEntity = ExpenseEntity = __decorate([
    (0, typeorm_1.Entity)('expenses'),
    (0, typeorm_1.Index)(['companyId', 'expenseDate']),
    (0, typeorm_1.Index)(['companyId', 'vendorId'])
], ExpenseEntity);
