"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIncomesQuerySchema = exports.incomeParamsSchema = exports.updateIncomeSchema = exports.createIncomeSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../shared/enums");
exports.createIncomeSchema = zod_1.z.object({
    companyId: zod_1.z.coerce.number().int().positive(),
    companyPublicId: zod_1.z.string().uuid().nullable().optional(),
    clientId: zod_1.z.coerce.number().int().positive().optional(),
    caseId: zod_1.z.coerce.number().int().positive().optional(),
    clientPublicId: zod_1.z.string().uuid().optional(),
    casePublicId: zod_1.z.string().uuid().optional(),
    amount: zod_1.z.coerce.number().positive(),
    currency: zod_1.z.string().length(3).default('USD'),
    incomeDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    categoryId: zod_1.z.coerce.number().int().positive(),
    paymentMethodCode: zod_1.z.string().min(2).max(20).toUpperCase(),
    description: zod_1.z.string().max(1000).optional(),
    referenceNumber: zod_1.z.string().max(100).optional(),
    status: zod_1.z.nativeEnum(enums_1.TransactionStatus).default(enums_1.TransactionStatus.PAID),
    source: zod_1.z.nativeEnum(enums_1.TransactionSource).default(enums_1.TransactionSource.MANUAL),
    externalProvider: zod_1.z.string().max(50).optional(),
    externalTransactionId: zod_1.z.string().max(150).optional(),
    createdBy: zod_1.z.string().min(1).max(100).optional()
});
exports.updateIncomeSchema = exports.createIncomeSchema.partial().omit({
    companyId: true,
    createdBy: true,
});
exports.incomeParamsSchema = zod_1.z.object({
    publicId: zod_1.z.string().uuid(),
});
exports.listIncomesQuerySchema = zod_1.z.object({
    clientId: zod_1.z.coerce.number().int().positive().optional(),
    caseId: zod_1.z.coerce.number().int().positive().optional(),
    clientPublicId: zod_1.z.string().uuid().optional(),
    casePublicId: zod_1.z.string().uuid().optional(),
    categoryId: zod_1.z.coerce.number().int().positive().optional(),
    paymentMethodCode: zod_1.z.string().min(2).max(20).optional(),
    status: zod_1.z.nativeEnum(enums_1.TransactionStatus).optional(),
    fromDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
