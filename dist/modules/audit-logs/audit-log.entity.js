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
exports.BillingAuditLogEntity = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const enums_1 = require("../../shared/enums");
let BillingAuditLogEntity = class BillingAuditLogEntity {
    constructor() {
        this.publicId = (0, uuid_1.v4)();
    }
};
exports.BillingAuditLogEntity = BillingAuditLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BillingAuditLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'public_id', type: 'uuid', unique: true }),
    __metadata("design:type", String)
], BillingAuditLogEntity.prototype, "publicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id', type: 'int' }),
    __metadata("design:type", Number)
], BillingAuditLogEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_public_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "companyPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_type', type: 'enum', enum: enums_1.AuditEntityType }),
    __metadata("design:type", String)
], BillingAuditLogEntity.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_public_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "entityPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.AuditAction }),
    __metadata("design:type", String)
], BillingAuditLogEntity.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'old_values', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "oldValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_values', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "newValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performed_by', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performed_by_email', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "performedByEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performed_by_username', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "performedByUsername", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performed_by_role', type: 'varchar', length: 80, nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "performedByRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'varchar', length: 80, nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BillingAuditLogEntity.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BillingAuditLogEntity.prototype, "createdAt", void 0);
exports.BillingAuditLogEntity = BillingAuditLogEntity = __decorate([
    (0, typeorm_1.Entity)('billing_audit_logs')
], BillingAuditLogEntity);
