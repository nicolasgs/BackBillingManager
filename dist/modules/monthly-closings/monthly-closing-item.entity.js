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
exports.MonthlyClosingItemEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/entities/base.entity");
const numeric_transformer_1 = require("../../shared/database/numeric.transformer");
const enums_1 = require("../../shared/enums");
const monthly_closing_entity_1 = require("./monthly-closing.entity");
let MonthlyClosingItemEntity = class MonthlyClosingItemEntity extends base_entity_1.BaseEntity {
};
exports.MonthlyClosingItemEntity = MonthlyClosingItemEntity;
__decorate([
    (0, typeorm_1.Column)({
        name: 'monthly_closing_id',
        type: 'int',
    }),
    __metadata("design:type", Number)
], MonthlyClosingItemEntity.prototype, "monthlyClosingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => monthly_closing_entity_1.MonthlyClosingEntity, (closing) => closing.items, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'monthly_closing_id' }),
    __metadata("design:type", monthly_closing_entity_1.MonthlyClosingEntity)
], MonthlyClosingItemEntity.prototype, "monthlyClosing", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'company_id',
        type: 'int',
    }),
    __metadata("design:type", Number)
], MonthlyClosingItemEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'company_public_id',
        type: 'uuid',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MonthlyClosingItemEntity.prototype, "companyPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entity_type',
        type: 'enum',
        enum: enums_1.ClosingItemType,
    }),
    __metadata("design:type", String)
], MonthlyClosingItemEntity.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entity_id',
        type: 'int',
    }),
    __metadata("design:type", Number)
], MonthlyClosingItemEntity.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entity_public_id',
        type: 'uuid',
    }),
    __metadata("design:type", String)
], MonthlyClosingItemEntity.prototype, "entityPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entity_description',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MonthlyClosingItemEntity.prototype, "entityDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], MonthlyClosingItemEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'transaction_date',
        type: 'date',
    }),
    __metadata("design:type", String)
], MonthlyClosingItemEntity.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'category_id',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MonthlyClosingItemEntity.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'category_name',
        type: 'varchar',
        length: 150,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MonthlyClosingItemEntity.prototype, "categoryName", void 0);
exports.MonthlyClosingItemEntity = MonthlyClosingItemEntity = __decorate([
    (0, typeorm_1.Entity)('monthly_closing_items'),
    (0, typeorm_1.Index)(['monthlyClosingId']),
    (0, typeorm_1.Index)(['companyId'])
], MonthlyClosingItemEntity);
