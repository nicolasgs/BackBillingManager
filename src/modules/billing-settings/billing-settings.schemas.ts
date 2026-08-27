import { z } from "zod";

export const updateBillingSettingsSchema = z.object({
  crmPaymentIncomeCategoryId: z.coerce.number().int().positive().nullable(),
});
