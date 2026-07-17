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
exports.MonthlyClosingEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/entities/base.entity");
const enums_1 = require("../../shared/enums");
const monthly_closing_item_entity_1 = require("./monthly-closing-item.entity");
let MonthlyClosingEntity = class MonthlyClosingEntity extends base_entity_1.BaseEntity {
};
exports.MonthlyClosingEntity = MonthlyClosingEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], MonthlyClosingEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_public_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], MonthlyClosingEntity.prototype, "companyPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MonthlyClosingEntity.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MonthlyClosingEntity.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_income', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyClosingEntity.prototype, "totalIncome", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_expense', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyClosingEntity.prototype, "totalExpense", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyClosingEntity.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.ClosingStatus, default: enums_1.ClosingStatus.DRAFT }),
    __metadata("design:type", String)
], MonthlyClosingEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MonthlyClosingEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'closed_by', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], MonthlyClosingEntity.prototype, "closedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'closed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], MonthlyClosingEntity.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => monthly_closing_item_entity_1.MonthlyClosingItemEntity, (item) => item.monthlyClosing),
    __metadata("design:type", Array)
], MonthlyClosingEntity.prototype, "items", void 0);
exports.MonthlyClosingEntity = MonthlyClosingEntity = __decorate([
    (0, typeorm_1.Entity)('monthly_closings'),
    (0, typeorm_1.Index)(['companyId', 'year', 'month'], { unique: true })
], MonthlyClosingEntity);
