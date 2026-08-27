import { NextFunction, Request, Response } from "express";

import { sendSuccess } from "../../shared/responses";

import { BillingSettingsService } from "./billing-settings.service";

const service = new BillingSettingsService();

export class BillingSettingsController {
  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: "AUTH_CONTEXT_MISSING",
          message:
            "Company ID was not found in the authenticated user context.",
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }

      const settings = await service.findByCompany(companyId);

      return sendSuccess({
        res,
        req,
        code: "BILLING_SETTINGS_FOUND",
        message: "Billing settings retrieved successfully",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: "AUTH_CONTEXT_MISSING",
          message:
            "Company ID was not found in the authenticated user context.",
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }

      const settings = await service.upsert({
        ...req.body,

        companyId,

        companyPublicId: req.user?.companyPublicId ?? null,

        createdBy: req.user?.id,
      });

      return sendSuccess({
        res,
        req,
        code: "BILLING_SETTINGS_UPDATED",
        message: "Billing settings updated successfully",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };
}
