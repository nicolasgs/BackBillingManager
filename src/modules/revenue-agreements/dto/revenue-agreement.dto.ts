import { z } from "zod";

import {
  createRevenueAgreementSchema,
  endRevenueAgreementSchema,
  listRevenueAgreementsQuerySchema,
} from "../revenue-agreement.schemas";

export type CreateRevenueAgreementDto = z.infer<
  typeof createRevenueAgreementSchema
>;

export type EndRevenueAgreementDto = z.infer<
  typeof endRevenueAgreementSchema
>;

export type ListRevenueAgreementsQueryDto = z.infer<
  typeof listRevenueAgreementsQuerySchema
>;
