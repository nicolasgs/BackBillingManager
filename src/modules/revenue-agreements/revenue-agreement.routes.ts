import { Router } from "express";

import { injectAuthContextToBody } from "../../middlewares/inject-auth-context.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { RevenueAgreementController } from "./revenue-agreement.controller";
import {
  createRevenueAgreementSchema,
  endRevenueAgreementSchema,
  listRevenueAgreementsQuerySchema,
  revenueAgreementParamsSchema,
} from "./revenue-agreement.schemas";

const router = Router();

const controller =
  new RevenueAgreementController();

router.post(
  "/",
  injectAuthContextToBody,
  validate(createRevenueAgreementSchema),
  controller.create,
);

router.get(
  "/",
  validate(
    listRevenueAgreementsQuerySchema,
    "query",
  ),
  controller.findAll,
);

router.post(
  "/:publicId/end",
  validate(
    revenueAgreementParamsSchema,
    "params",
  ),
  validate(endRevenueAgreementSchema),
  controller.end,
);

router.get(
  "/:publicId",
  validate(
    revenueAgreementParamsSchema,
    "params",
  ),
  controller.findOne,
);

export default router;
