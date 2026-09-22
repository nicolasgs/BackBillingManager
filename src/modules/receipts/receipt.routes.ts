import { Router } from "express";

import { validate } from "../../middlewares/validation.middleware";

import { ReceiptController } from "./receipt.controller";

import { receiptParamsSchema } from "./receipt.schemas";

const router = Router();

const controller = new ReceiptController();

router.get(
  "/:publicId/pdf",
  validate(receiptParamsSchema, "params"),
  controller.generatePdf,
);

router.get(
  "/:publicId",
  validate(receiptParamsSchema, "params"),
  controller.findOne,
);

export default router;
