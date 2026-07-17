"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodTypeParamsSchema = exports.updatePaymentMethodTypeSchema = exports.createPaymentMethodTypeSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentMethodTypeSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(20).toUpperCase(),
    description: zod_1.z.string().min(2).max(100),
});
exports.updatePaymentMethodTypeSchema = zod_1.z.object({
    description: zod_1.z.string().min(2).max(100).optional(),
});
exports.paymentMethodTypeParamsSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(20).toUpperCase(),
});
