"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reopenMonthlyClosingSchema = exports.closeMonthlyClosingSchema = exports.monthlyClosingParamsSchema = exports.listMonthlyClosingsQuerySchema = exports.createMonthlyClosingSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../shared/enums");
exports.createMonthlyClosingSchema = zod_1.z.object({
    companyId: zod_1.z.coerce.number().int().positive(),
    companyPublicId: zod_1.z.string().uuid().nullable().optional(),
    year: zod_1.z.coerce.number().int().min(2000).max(2100),
    month: zod_1.z.coerce.number().int().min(1).max(12),
    notes: zod_1.z.string().max(1000).nullable().optional(),
    createdBy: zod_1.z.string().min(1).max(100).optional(),
});
exports.listMonthlyClosingsQuerySchema = zod_1.z.object({
    year: zod_1.z.coerce.number().int().min(2000).max(2100).optional(),
    month: zod_1.z.coerce.number().int().min(1).max(12).optional(),
    status: zod_1.z.nativeEnum(enums_1.ClosingStatus).optional(),
});
exports.monthlyClosingParamsSchema = zod_1.z.object({
    publicId: zod_1.z.string().uuid(),
});
exports.closeMonthlyClosingSchema = zod_1.z
    .object({})
    .optional()
    .default({});
exports.reopenMonthlyClosingSchema = zod_1.z
    .object({
    notes: zod_1.z.string().max(1000).nullable().optional(),
})
    .optional()
    .default({});
