import { z } from "zod";

import { updateBillingSettingsSchema } from "../billing-settings.schemas";

export type UpdateBillingSettingsDto = z.infer<
  typeof updateBillingSettingsSchema
>;
