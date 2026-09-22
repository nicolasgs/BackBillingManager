import { z } from "zod";

import { TransactionSource, TransactionStatus } from "../../shared/enums";

export const createIncomeSchema = z.object({
  companyId: z.coerce.number().int().positive(),

  companyPublicId: z.string().uuid().nullable().optional(),

  clientId: z.coerce.number().int().positive().optional(),

  caseId: z.coerce.number().int().positive().optional(),

  clientPublicId: z.string().uuid().optional(),

  casePublicId: z.string().uuid().optional(),

  clientName: z.string().max(255).nullable().optional(),

  caseReference: z.string().max(255).nullable().optional(),

  amount: z.coerce.number().positive(),

  currency: z.string().length(3).default("USD"),

  incomeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  categoryId: z.coerce.number().int().positive(),

  paymentMethodCode: z.string().min(2).max(20).toUpperCase(),

  description: z.string().max(1000).optional(),

  referenceNumber: z.string().max(100).optional(),

  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PAID),

  source: z.nativeEnum(TransactionSource).default(TransactionSource.MANUAL),

  externalProvider: z.string().max(50).optional(),

  externalTransactionId: z.string().max(150).optional(),

  createdBy: z.string().min(1).max(100).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial().omit({
  companyId: true,
  createdBy: true,
});

export const incomeParamsSchema = z.object({
  publicId: z.string().uuid(),
});

export const listIncomesQuerySchema = z.object({
  clientId: z.coerce.number().int().positive().optional(),

  caseId: z.coerce.number().int().positive().optional(),

  clientPublicId: z.string().uuid().optional(),

  casePublicId: z.string().uuid().optional(),

  categoryId: z.coerce.number().int().positive().optional(),

  paymentMethodCode: z.string().min(2).max(20).optional(),

  status: z.nativeEnum(TransactionStatus).optional(),

  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  search: z.string().trim().min(1).max(150).optional(),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(25),

  sortBy: z
    .enum([
      "incomeDate",
      "amount",
      "clientName",
      "caseReference",
      "paymentMethodCode",
      "createdAt",
    ])
    .default("incomeDate"),

  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
});

export const createCrmPaymentIncomeSchema = z.object({
  paymentId: z.coerce.number().int().positive(),

  clientId: z.coerce.number().int().positive(),

  caseId: z.coerce.number().int().positive(),

  clientName: z.string().max(255).nullable().optional(),

  caseReference: z.string().max(255).nullable().optional(),

  amount: z.coerce.number().positive(),

  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  paymentMethodCode: z.string().min(2).max(20).toUpperCase(),

  referenceNumber: z.string().max(100).nullable().optional(),

  notes: z.string().max(1000).nullable().optional(),
});
