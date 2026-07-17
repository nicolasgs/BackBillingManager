"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodTypeParamsSchema = exports.updatePaymentMethodTypeSchema = exports.createPaymentMethodTypeSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentMethodTypeSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(20)
        .regex(/^[A-Za-z0-9_]+$/, 'Code may only contain letters, numbers, and underscores')
        .toUpperCase(),
    description: zod_1.z.string().trim().min(2).max(100),
});
exports.updatePaymentMethodTypeSchema = zod_1.z
    .object({
    description: zod_1.z.string().trim().min(2).max(100).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
exports.paymentMethodTypeParamsSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(20)
        .regex(/^[A-Za-z0-9_]+$/, 'Code may only contain letters, numbers, and underscores')
        .toUpperCase(),
});
