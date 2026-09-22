import path from "path";

import { HandlebarsCompiler } from "../../infrastructure/pdf/handlebars-compiler";
import { PdfGenerator } from "../../infrastructure/pdf/pdf-generator";

import { ReceiptEntity } from "./receipt.entity";

interface ReceiptPdfData {
  logoUrl?: string | null;
  companyName: string;
  companyAddress?: string | null;
  companyPhone?: string | null;
  companyEmail?: string | null;

  receiptNumber: string;

  paymentDate: string;
  paymentMethodCode: string;
  referenceNumber?: string | null;

  clientName?: string | null;
  caseReference?: string | null;

  currencySymbol: string;
  amount: string;

  description?: string | null;

  issuedAt: string;
}

export class ReceiptPdfService {
  constructor(
    private readonly compiler = new HandlebarsCompiler(),
    private readonly pdfGenerator = new PdfGenerator(),
  ) {}

  async generate(receipt: ReceiptEntity): Promise<Buffer> {
    const templatePath = path.resolve(
      process.cwd(),
      "src",
      "modules",
      "receipts",
      "templates",
      "payment-receipt.handlebars",
    );

    const data = this.buildTemplateData(receipt);

    const html = await this.compiler.compileTemplateByPath(templatePath, data);

    return this.pdfGenerator.generateFromHtml(html, {
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "18mm",
        bottom: "18mm",
        left: "18mm",
      },
    });
  }

  async close(): Promise<void> {
    await this.pdfGenerator.close();
  }

  private buildTemplateData(receipt: ReceiptEntity): ReceiptPdfData {
    return {
      /*
       * Temporary company information.
       *
       * We will replace this with the real
       * company profile once Billing can
       * resolve company data directly.
       */

      logoUrl: process.env.RECEIPT_LOGO_URL ?? null,

      companyName: "MindPro Multiservices",

      companyAddress: null,

      companyPhone: null,

      companyEmail: null,

      receiptNumber: receipt.receiptNumber,

      paymentDate: this.formatDate(receipt.paymentDate),

      paymentMethodCode: receipt.paymentMethodCode ?? "N/A",

      referenceNumber: receipt.referenceNumber ?? null,

      clientName: receipt.clientName ?? null,

      caseReference: receipt.caseReference ?? null,

      currencySymbol: this.getCurrencySymbol(receipt.currency),

      amount: this.formatAmount(receipt.amount),

      description: receipt.description ?? null,

      issuedAt: this.formatDateTime(receipt.issuedAt),
    };
  }

  private formatAmount(value: number): string {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private getCurrencySymbol(currency: string): string {
    switch (currency.toUpperCase()) {
      case "USD":
        return "$";

      case "EUR":
        return "€";

      case "GBP":
        return "£";

      default:
        return `${currency} `;
    }
  }

  private formatDate(value: string): string {
    const date = new Date(`${value}T00:00:00`);

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  private formatDateTime(value: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(value);
  }
}
