"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBillingCategoriesQuerySchema = exports.billingCategoryParamsSchema = exports.updateBillingCategorySchema = exports.createBillingCategorySchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../shared/enums");
exports.createBillingCategorySchema = zod_1.z.object({
    companyId: zod_1.z.coerce.number().int().positive(),
    companyPublicId: zod_1.z.string().uuid().nullable().optional(),
    name: zod_1.z.string().min(2).max(120),
    type: zod_1.z.nativeEnum(enums_1.BillingCategoryType),
    description: zod_1.z.string().max(500).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
    createdBy: zod_1.z.string().min(1).max(100).optional(),
});
exports.updateBillingCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(120).optional(),
    type: zod_1.z.nativeEnum(enums_1.BillingCategoryType).optional(),
    description: zod_1.z.string().max(500).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.billingCategoryParamsSchema = zod_1.z.object({
    publicId: zod_1.z.string().uuid(),
});
exports.listBillingCategoriesQuerySchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(enums_1.BillingCategoryType).optional(),
    isActive: zod_1.z
        .string()
        .optional()
        .transform((value) => {
        if (value === undefined)
            return undefined;
        return value === 'true';
    }),
});
