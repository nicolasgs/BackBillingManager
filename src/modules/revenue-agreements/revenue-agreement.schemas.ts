import { z } from "zod";

import {
  CompensationType,
  RevenueParticipantType,
} from "../../shared/enums";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/);

export const createRevenueAgreementSchema = z
  .object({
    companyId: z.coerce.number().int().positive(),

    companyPublicId: z.string().uuid().nullable().optional(),

    caseId: z.coerce
      .string()
      .regex(/^\d+$/)
      .nullable()
      .optional(),

    casePublicId: z.string().uuid(),

    participantType: z.nativeEnum(RevenueParticipantType),

    participantPublicId: z.string().uuid(),

    participantName: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .nullable()
      .optional(),

    compensationType: z.nativeEnum(CompensationType),

    percentage: z.coerce
      .number()
      .positive()
      .max(100)
      .nullable()
      .optional(),

    fixedAmount: z.coerce
      .number()
      .positive()
      .nullable()
      .optional(),

    priority: z.coerce
      .number()
      .int()
      .positive()
      .default(100),

    effectiveFrom: dateSchema,

    createdBy: z.string().min(1).max(100).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.compensationType === CompensationType.PERCENTAGE) {
      if (
        value.percentage === undefined ||
        value.percentage === null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["percentage"],
          message:
            "percentage is required when compensationType is PERCENTAGE",
        });
      }

      if (
        value.fixedAmount !== undefined &&
        value.fixedAmount !== null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fixedAmount"],
          message:
            "fixedAmount must be null when compensationType is PERCENTAGE",
        });
      }
    }

    if (value.compensationType === CompensationType.FIXED) {
      if (
        value.fixedAmount === undefined ||
        value.fixedAmount === null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fixedAmount"],
          message:
            "fixedAmount is required when compensationType is FIXED",
        });
      }

      if (
        value.percentage !== undefined &&
        value.percentage !== null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["percentage"],
          message:
            "percentage must be null when compensationType is FIXED",
        });
      }
    }
  });

export const revenueAgreementParamsSchema = z.object({
  publicId: z.string().uuid(),
});

export const endRevenueAgreementSchema = z.object({
  endedAt: dateSchema,
});

export const listRevenueAgreementsQuerySchema = z.object({
  casePublicId: z.string().uuid().optional(),

  participantPublicId: z.string().uuid().optional(),

  participantType: z
    .nativeEnum(RevenueParticipantType)
    .optional(),

  compensationType: z
    .nativeEnum(CompensationType)
    .optional(),

  active: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});
