import { z } from 'zod'
import { TransactionSource, TransactionStatus } from '../../shared/enums'

export const createIncomeSchema = z.object({
    companyId: z.coerce.number().int().positive(),
    companyPublicId: z.string().uuid().optional(),

    clientId: z.coerce.number().int().positive().optional(),
    caseId: z.coerce.number().int().positive().optional(),

    clientPublicId: z.string().uuid().optional(),
    casePublicId: z.string().uuid().optional(),

    amount: z.coerce.number().positive(),
    currency: z.string().length(3).default('USD'),

    incomeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

    categoryId: z.coerce.number().int().positive(),
    paymentMethodCode: z.string().min(2).max(20).toUpperCase(),

    description: z.string().max(1000).optional(),
    referenceNumber: z.string().max(100).optional(),

    status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PAID),
    source: z.nativeEnum(TransactionSource).default(TransactionSource.MANUAL),

    externalProvider: z.string().max(50).optional(),
    externalTransactionId: z.string().max(150).optional(),

    createdBy: z.string().uuid().optional(),
    })

export const updateIncomeSchema = createIncomeSchema.partial().omit({
    companyId: true,
    createdBy: true,
})

export const incomeParamsSchema = z.object({
    publicId: z.string().uuid(),
})

export const listIncomesQuerySchema = z.object({
    companyId: z.coerce.number().int().positive(),
    companyPublicId: z.string().uuid().optional(),
    clientId: z.coerce.number().int().positive().optional(),
    caseId: z.coerce.number().int().positive().optional(),

    clientPublicId: z.string().uuid().optional(),
    casePublicId: z.string().uuid().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    paymentMethodCode: z.string().min(2).max(20).optional(),
    status: z.nativeEnum(TransactionStatus).optional(),
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})