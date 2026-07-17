"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listExpensesQuerySchema = exports.expenseParamsSchema = exports.updateExpenseSchema = exports.createExpenseSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../shared/enums");
exports.createExpenseSchema = zod_1.z.object({
    companyId: zod_1.z.coerce.number().int().positive(),
    companyPublicId: zod_1.z.string().uuid().nullable().optional(),
    vendorId: zod_1.z.coerce.number().int().positive().optional(),
    vendorPublicId: zod_1.z.string().uuid().nullable().optional(),
    vendorName: zod_1.z.string().max(150).nullable().optional(),
    amount: zod_1.z.coerce.number().positive(),
    currency: zod_1.z.string().length(3).default('USD'),
    expenseDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    categoryId: zod_1.z.coerce.number().int().positive(),
    paymentMethodCode: zod_1.z.string().min(2).max(20).toUpperCase(),
    description: zod_1.z.string().max(1000).nullable().optional(),
    referenceNumber: zod_1.z.string().max(100).nullable().optional(),
    status: zod_1.z.nativeEnum(enums_1.TransactionStatus).default(enums_1.TransactionStatus.PAID),
    source: zod_1.z.nativeEnum(enums_1.TransactionSource).default(enums_1.TransactionSource.MANUAL),
    externalProvider: zod_1.z.string().max(50).nullable().optional(),
    externalTransactionId: zod_1.z.string().max(150).nullable().optional(),
    createdBy: zod_1.z.string().min(1).max(100).optional()
});
exports.updateExpenseSchema = exports.createExpenseSchema.partial().omit({
    companyId: true,
    createdBy: true,
});
exports.expenseParamsSchema = zod_1.z.object({
    publicId: zod_1.z.string().uuid(),
});
exports.listExpensesQuerySchema = zod_1.z.object({
    vendorId: zod_1.z.coerce.number().int().positive().optional(),
    vendorPublicId: zod_1.z.string().uuid().nullable().optional(),
    vendorName: zod_1.z.string().max(150).optional(),
    categoryId: zod_1.z.coerce.number().int().positive().optional(),
    paymentMethodCode: zod_1.z.string().min(2).max(20).optional(),
    status: zod_1.z.nativeEnum(enums_1.TransactionStatus).optional(),
    fromDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
