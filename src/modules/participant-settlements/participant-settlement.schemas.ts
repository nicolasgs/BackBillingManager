import { z } from "zod";

import {
  ParticipantSettlementStatus,
  RevenueOwnerType,
} from "../../shared/enums";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/);

const moneySchema = z.coerce
  .number()
  .positive()
  .max(9999999999.99)
  .refine(
    (value) =>
      Math.abs(
        value * 100 -
          Math.round(value * 100),
      ) < 0.0000001,
    {
      message:
        "amount cannot contain more than two decimal places",
    },
  );

export const participantStatementParamsSchema =
  z.object({
    statementPublicId: z.string().uuid(),
  });

export const participantSettlementParamsSchema =
  z.object({
    publicId: z.string().uuid(),
  });

export const participantPayoutParamsSchema =
  z.object({
    publicId: z.string().uuid(),
  });

export const createParticipantSettlementSchema =
  z.object({
    notes: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),
  });

export const createParticipantPayoutSchema =
  z
    .object({
      amount: moneySchema,

      currency: z.literal("USD").default("USD"),

      payoutDate: dateSchema,

      paymentMethodCode: z
        .string()
        .trim()
        .min(1)
        .max(20)
        .transform((value) =>
          value.toUpperCase(),
        ),

      referenceNumber: z
        .string()
        .trim()
        .max(100)
        .nullable()
        .optional(),

      notes: z
        .string()
        .trim()
        .max(5000)
        .nullable()
        .optional(),

      externalProvider: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .nullable()
        .optional(),

      externalTransactionId: z
        .string()
        .trim()
        .min(1)
        .max(150)
        .nullable()
        .optional(),
    })
    .superRefine((value, ctx) => {
      const hasProvider =
        value.externalProvider !== undefined &&
        value.externalProvider !== null;

      const hasTransaction =
        value.externalTransactionId !==
          undefined &&
        value.externalTransactionId !== null;

      if (hasProvider !== hasTransaction) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            hasProvider
              ? "externalTransactionId"
              : "externalProvider",
          ],
          message:
            "externalProvider and externalTransactionId must be provided together",
        });
      }
    });

export const voidParticipantPayoutSchema =
  z.object({
    voidReason: z
      .string()
      .trim()
      .min(1)
      .max(500),
  });

export const listParticipantSettlementsQuerySchema =
  z.object({
    status: z
      .nativeEnum(
        ParticipantSettlementStatus,
      )
      .optional(),

    ownerType: z
      .nativeEnum(RevenueOwnerType)
      .optional(),

    ownerPublicId: z
      .string()
      .uuid()
      .optional(),

    participantStatementPublicId: z
      .string()
      .uuid()
      .optional(),

    year: z.coerce
      .number()
      .int()
      .min(2000)
      .max(2100)
      .optional(),

    month: z.coerce
      .number()
      .int()
      .min(1)
      .max(12)
      .optional(),
  });