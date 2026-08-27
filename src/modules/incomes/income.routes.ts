import { Router } from "express";

import { validate } from "../../middlewares/validation.middleware";

import { injectAuthContextToBody } from "../../middlewares/inject-auth-context.middleware";

import { IncomeController } from "./income.controller";

import {
  createCrmPaymentIncomeSchema,
  createIncomeSchema,
  incomeParamsSchema,
  listIncomesQuerySchema,
  updateIncomeSchema,
} from "./income.schemas";

const router = Router();

const controller = new IncomeController();

/*
 * Create manual Income
 */
router.post(
  "/",
  injectAuthContextToBody,
  validate(createIncomeSchema),
  controller.create,
);

/*
 * CRM Payment -> Income
 *
 * IMPORTANT:
 * Keep static routes before /:publicId.
 */
router.post(
  "/crm-payment",
  validate(createCrmPaymentIncomeSchema),
  controller.createFromCrmPayment,
);

/*
 * List
 */
router.get("/", validate(listIncomesQuerySchema, "query"), controller.findAll);

/*
 * Detail
 */
router.get(
  "/:publicId",
  validate(incomeParamsSchema, "params"),
  controller.findOne,
);

/*
 * Update
 */
router.patch(
  "/:publicId",
  validate(incomeParamsSchema, "params"),
  validate(updateIncomeSchema),
  controller.update,
);

/*
 * Delete
 */
router.delete(
  "/:publicId",
  validate(incomeParamsSchema, "params"),
  controller.remove,
);

export default router;
