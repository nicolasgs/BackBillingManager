import { z } from "zod";
import {
  createMonthlyClosingSchema,
  listMonthlyClosingsQuerySchema,
  reopenMonthlyClosingSchema,
  closeMonthlyClosingSchema,
} from "../monthly-closing.schemas";

export type CreateMonthlyClosingDto = z.infer<
  typeof createMonthlyClosingSchema
>;

export type ListMonthlyClosingsQueryDto = z.infer<
  typeof listMonthlyClosingsQuerySchema
>;

export type ReopenMonthlyClosingDto = z.infer<
  typeof reopenMonthlyClosingSchema
>;

export type CloseMonthlyClosingDto = z.infer<typeof closeMonthlyClosingSchema>;
