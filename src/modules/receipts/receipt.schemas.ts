import { z } from "zod";

export const receiptParamsSchema = z.object({
  publicId: z.string().uuid(),
});
