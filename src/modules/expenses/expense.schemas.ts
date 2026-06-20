import { z } from 'zod'
import { TransactionSource, TransactionStatus } from '../../shared/enums'

export const createExpenseSchema = z.object({
    companyId: z.coerce.number().int().positive(),
    companyPublicId: z.string().uuid().nullable().optional(),

    vendorId: z.coerce.number().int().positive().optional(),
    vendorPublicId: z.string().uuid().nullable().optional(),
    vendorName: z.string().max(150).nullable().optional(),

    amount: z.coerce.number().positive(),
    currency: z.string().length(3).default('USD'),

    expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

    categoryId: z.coerce.number().int().positive(),
    paymentMethodCode: z.string().min(2).max(20).toUpperCase(),

    description: z.string().max(1000).nullable().optional(),
    referenceNumber: z.string().max(100).nullable().optional(),

    status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PAID),
    source: z.nativeEnum(TransactionSource).default(TransactionSource.MANUAL),

    externalProvider: z.string().max(50).nullable().optional(),
    externalTransactionId: z.string().max(150).nullable().optional(),

    createdBy: z.string().min(1).max(100).optional()
})

export const updateExpenseSchema = createExpenseSchema.partial().omit({
    companyId: true,
    createdBy: true,
})

export const expenseParamsSchema = z.object({
    publicId: z.string().uuid(),
})

export const listExpensesQuerySchema = z.object({
    companyId: z.coerce.number().int().positive(),
    companyPublicId: z.string().uuid().nullable().optional(),

    vendorId: z.coerce.number().int().positive().optional(),
    vendorPublicId: z.string().uuid().nullable().optional(),
    vendorName: z.string().max(150).optional(),

    categoryId: z.coerce.number().int().positive().optional(),
    paymentMethodCode: z.string().min(2).max(20).optional(),
    status: z.nativeEnum(TransactionStatus).optional(),

    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})