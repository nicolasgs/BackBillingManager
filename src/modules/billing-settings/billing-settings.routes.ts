import { Router } from "express";

import { validate } from "../../middlewares/validation.middleware";

import { BillingSettingsController } from "./billing-settings.controller";

import { updateBillingSettingsSchema } from "./billing-settings.schemas";

const router = Router();

const controller = new BillingSettingsController();

router.get("/", controller.findOne);

router.patch("/", validate(updateBillingSettingsSchema), controller.update);

export default router;
