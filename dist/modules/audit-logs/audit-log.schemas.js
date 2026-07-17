"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogsQuerySchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../shared/enums");
exports.listAuditLogsQuerySchema = zod_1.z.object({
    entityType: zod_1.z.nativeEnum(enums_1.AuditEntityType).optional(),
    entityId: zod_1.z.coerce.number().int().positive().optional(),
    entityPublicId: zod_1.z.string().uuid().optional(),
    action: zod_1.z.nativeEnum(enums_1.AuditAction).optional(),
    fromDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
