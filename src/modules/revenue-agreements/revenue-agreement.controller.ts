import {
  NextFunction,
  Request,
  Response,
} from "express";

import { sendSuccess } from "../../shared/responses";
import { buildAuthContext } from "../../shared/utils/build-auth-context";
import { RevenueAgreementFilters } from "./interfaces/revenue-agreement-filters.interface";
import { RevenueAgreementService } from "./revenue-agreement.service";

const service = new RevenueAgreementService();

export class RevenueAgreementController {
  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authContext = buildAuthContext(req);

      const payload = {
        ...req.body,

        companyId: req.user?.companyId,

        companyPublicId:
          req.user?.companyPublicId ?? null,

        createdBy: req.user?.id,
      };

      const agreement =
        await service.create(
          payload,
          authContext,
        );

      return sendSuccess({
        res,
        req,
        statusCode: 201,
        code: "REVENUE_AGREEMENT_CREATED",
        message:
          "Revenue agreement created successfully",
        data: agreement,
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
        return res.status(401).json({
          success: false,
          code: "AUTH_CONTEXT_MISSING",
          message:
            "Company ID was not found in the authenticated user context",
          path: req.originalUrl,
          timestamp:
            new Date().toISOString(),
        });
      }

      const queryFilters =
        req.query as unknown as Omit<
          RevenueAgreementFilters,
          "companyId"
        >;

      const filters:
        RevenueAgreementFilters = {
          ...queryFilters,
          companyId,
        };

      const agreements =
        await service.findAll(filters);

      return sendSuccess({
        res,
        req,
        code: "REVENUE_AGREEMENTS_FOUND",
        message:
          "Revenue agreements retrieved successfully",
        data: agreements,
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
      const { publicId } =
        req.params as {
          publicId: string;
        };

      const companyId =
        req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: "AUTH_CONTEXT_MISSING",
          message:
            "Company ID was not found in the authenticated user context",
          path: req.originalUrl,
          timestamp:
            new Date().toISOString(),
        });
      }

      const agreement =
        await service.findByPublicId(
          publicId,
          companyId,
        );

      return sendSuccess({
        res,
        req,
        code: "REVENUE_AGREEMENT_FOUND",
        message:
          "Revenue agreement retrieved successfully",
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  };

  end = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { publicId } =
        req.params as {
          publicId: string;
        };

      const companyId =
        req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: "AUTH_CONTEXT_MISSING",
          message:
            "Company ID was not found in the authenticated user context",
          path: req.originalUrl,
          timestamp:
            new Date().toISOString(),
        });
      }

      const authContext =
        buildAuthContext(req);

      const agreement =
        await service.end(
          publicId,
          req.body,
          companyId,
          authContext,
        );

      return sendSuccess({
        res,
        req,
        code: "REVENUE_AGREEMENT_ENDED",
        message:
          "Revenue agreement ended successfully",
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  };
}
