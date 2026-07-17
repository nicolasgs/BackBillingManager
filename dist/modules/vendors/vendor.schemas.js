"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVendorsQuerySchema = exports.vendorParamsSchema = exports.updateVendorSchema = exports.createVendorSchema = void 0;
const zod_1 = require("zod");
exports.createVendorSchema = zod_1.z.object({
    companyId: zod_1.z.coerce.number().int().positive(),
    companyPublicId: zod_1.z.string().uuid().nullable().optional(),
    name: zod_1.z.string().min(2).max(150),
    email: zod_1.z.string().email().nullable().optional(),
    phone: zod_1.z.string().max(30).nullable().optional(),
    website: zod_1.z.string().max(150).nullable().optional(),
    taxId: zod_1.z.string().max(50).nullable().optional(),
    notes: zod_1.z.string().max(1000).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
    createdBy: zod_1.z.string().min(1).max(100).optional()
});
exports.updateVendorSchema = exports.createVendorSchema.partial().omit({
    companyId: true,
    createdBy: true,
});
exports.vendorParamsSchema = zod_1.z.object({
    publicId: zod_1.z.string().uuid(),
});
exports.listVendorsQuerySchema = zod_1.z.object({
    search: zod_1.z.string().max(150).optional(),
    isActive: zod_1.z
        .string()
        .optional()
        .transform((value) => {
        if (value === undefined)
            return undefined;
        return value === 'true';
    }),
});
