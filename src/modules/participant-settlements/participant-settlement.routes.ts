import { Router } from "express";

import { validate } from "../../middlewares/validation.middleware";
import { ParticipantSettlementController } from "./participant-settlement.controller";
import {
  createParticipantPayoutSchema,
  createParticipantSettlementSchema,
  listParticipantSettlementsQuerySchema,
  participantPayoutParamsSchema,
  participantSettlementParamsSchema,
  participantStatementParamsSchema,
  voidParticipantPayoutSchema,
} from "./participant-settlement.schemas";

const controller =
  new ParticipantSettlementController();


/*
 * /participant-settlements
 */
const settlementRouter =
  Router();

settlementRouter.get(
  "/",
  validate(
    listParticipantSettlementsQuerySchema,
    "query",
  ),
  controller.findAll,
);

settlementRouter.post(
  "/:publicId/payouts",
  validate(
    participantSettlementParamsSchema,
    "params",
  ),
  validate(
    createParticipantPayoutSchema,
  ),
  controller.createPayout,
);

settlementRouter.get(
  "/:publicId",
  validate(
    participantSettlementParamsSchema,
    "params",
  ),
  controller.findOne,
);


/*
 * /participant-statements
 */
export const participantStatementSettlementRoutes =
  Router();

participantStatementSettlementRoutes.post(
  "/:statementPublicId/settlement",
  validate(
    participantStatementParamsSchema,
    "params",
  ),
  validate(
    createParticipantSettlementSchema,
  ),
  controller.createFromStatement,
);


/*
 * /participant-payouts
 */
export const participantPayoutRoutes =
  Router();

participantPayoutRoutes.post(
  "/:publicId/void",
  validate(
    participantPayoutParamsSchema,
    "params",
  ),
  validate(
    voidParticipantPayoutSchema,
  ),
  controller.voidPayout,
);

export default settlementRouter;