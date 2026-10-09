import {
  NextFunction,
  Request,
  Response,
} from "express";

import { sendSuccess } from "../../shared/responses";
import { buildAuthContext } from "../../shared/utils/build-auth-context";
import { ParticipantSettlementFilters } from "./interfaces/participant-settlement-filters.interface";
import { ParticipantSettlementService } from "./participant-settlement.service";

const service =
  new ParticipantSettlementService();

const authContextMissing = (
  req: Request,
  res: Response,
) =>
  res.status(401).json({
    success: false,
    code: "AUTH_CONTEXT_MISSING",
    message:
      "Authenticated company or user context is missing",
    path: req.originalUrl,
    timestamp:
      new Date().toISOString(),
  });

export class ParticipantSettlementController {
  createFromStatement = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {
        statementPublicId,
      } = req.params as {
        statementPublicId: string;
      };

      const companyId =
        req.user?.companyId;

      const actorId =
        req.user?.id;

      if (
        !companyId ||
        !actorId
      ) {
        return authContextMissing(
          req,
          res,
        );
      }

      const authContext =
        buildAuthContext(req);

      const result =
        await service.createFromStatement(
          statementPublicId,
          req.body,
          companyId,
          String(actorId),
          authContext,
        );

      return sendSuccess({
        res,
        req,
        statusCode:
          result.created
            ? 201
            : 200,
        code:
          result.created
            ? "PARTICIPANT_SETTLEMENT_CREATED"
            : "PARTICIPANT_SETTLEMENT_ALREADY_EXISTS",
        message:
          result.created
            ? "Participant settlement created successfully"
            : "Participant settlement already exists",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const companyId =
        req.user?.companyId;

      if (!companyId) {
        return authContextMissing(
          req,
          res,
        );
      }

      const queryFilters =
        req.query as unknown as Omit<
          ParticipantSettlementFilters,
          "companyId"
        >;

      const settlements =
        await service.findAll({
          ...queryFilters,
          companyId,
        });

      return sendSuccess({
        res,
        req,
        code:
          "PARTICIPANT_SETTLEMENTS_FOUND",
        message:
          "Participant settlements retrieved successfully",
        data:
          settlements,
      });
    } catch (error) {
      next(error);
    }
  };

  findOne = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {
        publicId,
      } = req.params as {
        publicId: string;
      };

      const companyId =
        req.user?.companyId;

      if (!companyId) {
        return authContextMissing(
          req,
          res,
        );
      }

      const settlement =
        await service.findByPublicId(
          publicId,
          companyId,
        );

      return sendSuccess({
        res,
        req,
        code:
          "PARTICIPANT_SETTLEMENT_FOUND",
        message:
          "Participant settlement retrieved successfully",
        data:
          settlement,
      });
    } catch (error) {
      next(error);
    }
  };

  createPayout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {
        publicId,
      } = req.params as {
        publicId: string;
      };

      const companyId =
        req.user?.companyId;

      const actorId =
        req.user?.id;

      if (
        !companyId ||
        !actorId
      ) {
        return authContextMissing(
          req,
          res,
        );
      }

      const authContext =
        buildAuthContext(req);

      const result =
        await service.createPayout(
          publicId,
          req.body,
          companyId,
          String(actorId),
          authContext,
        );

      return sendSuccess({
        res,
        req,
        statusCode:
          result.created
            ? 201
            : 200,
        code:
          result.created
            ? "PARTICIPANT_PAYOUT_CREATED"
            : "PARTICIPANT_PAYOUT_IDEMPOTENT_REPLAY",
        message:
          result.created
            ? "Participant payout created successfully"
            : "Participant payout already exists for this external transaction",
        data:
          result,
      });
    } catch (error) {
      next(error);
    }
  };

  voidPayout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {
        publicId,
      } = req.params as {
        publicId: string;
      };

      const companyId =
        req.user?.companyId;

      const actorId =
        req.user?.id;

      if (
        !companyId ||
        !actorId
      ) {
        return authContextMissing(
          req,
          res,
        );
      }

      const authContext =
        buildAuthContext(req);

      const result =
        await service.voidPayout(
          publicId,
          req.body,
          companyId,
          String(actorId),
          authContext,
        );

      return sendSuccess({
        res,
        req,
        code:
          result.voided
            ? "PARTICIPANT_PAYOUT_VOIDED"
            : "PARTICIPANT_PAYOUT_ALREADY_VOIDED",
        message:
          result.voided
            ? "Participant payout voided successfully"
            : "Participant payout was already voided",
        data:
          result,
      });
    } catch (error) {
      next(error);
    }
  };
}