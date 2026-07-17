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
exports.BillingCategoryEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/entities/base.entity");
const enums_1 = require("../../shared/enums");
let BillingCategoryEntity = class BillingCategoryEntity extends base_entity_1.BaseEntity {
};
exports.BillingCategoryEntity = BillingCategoryEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], BillingCategoryEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_public_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], BillingCategoryEntity.prototype, "companyPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], BillingCategoryEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.BillingCategoryType,
    }),
    __metadata("design:type", String)
], BillingCategoryEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BillingCategoryEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BillingCategoryEntity.prototype, "isActive", void 0);
exports.BillingCategoryEntity = BillingCategoryEntity = __decorate([
    (0, typeorm_1.Entity)('billing_categories'),
    (0, typeorm_1.Index)(['companyId']),
    (0, typeorm_1.Index)(['companyPublicId']),
    (0, typeorm_1.Index)(['companyId', 'name', 'type'], { unique: true })
], BillingCategoryEntity);
