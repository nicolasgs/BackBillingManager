import type { NextFunction, Request, Response } from "express";

import { sendSuccess } from "../../shared/responses";

import { ReceiptService } from "./receipt.service";
import { ReceiptPdfService } from "./receipt-pdf.service";

const service = new ReceiptService();
const pdfService = new ReceiptPdfService();

export class ReceiptController {
  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params as {
        publicId: string;
      };

      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: "AUTH_CONTEXT_MISSING",
          message: "Company ID was not found in the authenticated user context",
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }

      const receipt = await service.findByPublicId(publicId, companyId);

      return sendSuccess({
        res,
        req,
        code: "RECEIPT_FOUND",
        message: "Receipt retrieved successfully",
        data: receipt,
      });
    } catch (error) {
      next(error);
    }
  };

  generatePdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params as {
        publicId: string;
      };

      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: "AUTH_CONTEXT_MISSING",
          message: "Company ID was not found in the authenticated user context",
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }

      const receipt = await service.findByPublicId(publicId, companyId);

      const pdf = await pdfService.generate(receipt);

      const fileName = `${receipt.receiptNumber}.pdf`;

      res.setHeader("Content-Type", "application/pdf");

      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

      res.setHeader("Content-Length", pdf.length.toString());

      return res.status(200).send(pdf);
    } catch (error) {
      next(error);
    }
  };
}
